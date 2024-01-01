/* eslint-disable react/prop-types */
import { toast } from "react-toastify";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import PullToRefresh from "react-simple-pull-to-refresh";

import { IconButton, Skeleton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import { confugureUser } from "../../controllers/userController";
import {
  deleteEmail,
  deleteEmailSent,
  updateEmail,
} from "../../controllers/emailController";
import { emitter, listenToEvent } from "../../utils/eventemitter";
import noRecorePlaceholder from "../../assets/noRecored-placeholder.png";

import { truncateText } from "../../utils/helperFunctions";

import "./customDataTable.css";
import "./maincontainer.css";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../utils/useAuth";
import { socket } from "../authorizeUser";
import Loader from "../Loader";

const messages = {
  SHOW_ALL_INBOX: "SHOW_ALL_INBOX",
  SHOW_ALL_STARRED: "SHOW_ALL_STARRED",
  SHOW_ALL_SENT: "SHOW_ALL_SENT",
  SHOW_ALL_ARCHIVED: "SHOW_ALL_ARCHIVED",
  GLOBAL_SEARCH_QUERY: "GLOBAL_SEARCH_QUERY",
};
const filterObjs = {
  "/inbox": "SHOW_ALL_INBOX",
  "/star": "SHOW_ALL_STARRED",
  "/sent": "SHOW_ALL_SENT",
  "/archived": "SHOW_ALL_ARCHIVED",
  GLOBAL_SEARCH_QUERY: "GLOBAL_SEARCH_QUERY",
};

const varient = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};
const MainContainer = () => {
  const { pathname } = useLocation();

  const { user } = useAuth();
  const [emailData, setEmailData] = useState(undefined);
  const filterTrackerRef = useRef(filterObjs[pathname]);

  const fetchData = useCallback(
    async (filterType, forcerefresh = false, globalQuery) => {
      filterTrackerRef.current = filterType;
      setEmailData(undefined);
      const { response } = await confugureUser(
        {
          email: user.email,
          name: user.name,
          ...(globalQuery ? { globalQuery } : {}),
        },
        filterType
      );
      setEmailData(response?.emailContent);
      return response;
    },
    [user]
  );

  useEffect(() => {
    (async function fetchUser() {
      if (user) {
        fetchData(filterTrackerRef.current);
      }
    })();
  }, [fetchData, user]);

  useEffect(() => {
    // Listen for messages from the server
    socket.on("NEW_EMAIL_RECEIVED", (email) => {
      setEmailData((prev) => [email, ...prev]);
    });
    // Clean up the socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const filterEmailsViaId = useCallback((_id) => {
    setEmailData((prev) => prev.filter((e) => e._id !== _id));
  }, []);

  useEffect(() => {
    listenToEvent(messages.SHOW_ALL_INBOX, () => {
      fetchData(messages.SHOW_ALL_INBOX);
    });
    listenToEvent(messages.SHOW_ALL_STARRED, () => {
      fetchData(messages.SHOW_ALL_STARRED);
    });
    listenToEvent(messages.SHOW_ALL_SENT, () => {
      fetchData(messages.SHOW_ALL_SENT);
    });
    listenToEvent(messages.SHOW_ALL_ARCHIVED, () => {
      fetchData(messages.SHOW_ALL_ARCHIVED);
    });
    listenToEvent(messages.GLOBAL_SEARCH_QUERY, (txt) => {
      fetchData(messages.GLOBAL_SEARCH_QUERY, true, txt);
    });

    return () => {
      emitter.off(messages.SHOW_ALL_INBOX, () => {});
      emitter.off(messages.SHOW_ALL_STARRED, () => {});
      emitter.off(messages.SHOW_ALL_SENT, () => {});
      emitter.off(messages.SHOW_ALL_ARCHIVED, () => {});
      emitter.off(messages.GLOBAL_SEARCH_QUERY, () => {});
    };
  }, [fetchData]);

  const updatePerEmail = useCallback((key, value, _id) => {
    setEmailData((prev) => {
      return prev.map((e) => {
        if (e._id === _id) {
          e[key] = value;
          return e;
        } else return e;
      });
    });
  }, []);

  return (
    <motion.div className="main-email-container">
      {emailData === undefined ? (
        // <CustomDataTableSkeletonLoader />
        <Loader />
      ) : (
        // <DataTable data={emailData} columns={columns} />
        <CustomDataTable
          data={emailData || []}
          fetchData={fetchData}
          updatePerEmail={updatePerEmail}
          filterEmailsViaId={filterEmailsViaId}
          user={user}
          filterTrackerRef={filterTrackerRef}
        />
      )}
    </motion.div>
  );
};

const CustomDataTable = memo(
  ({
    data = [],
    fetchData,
    user,
    filterEmailsViaId,
    filterTrackerRef,
    updatePerEmail,
  }) => {
    const navigate = useNavigate();
    // const [openOneEmail, setOpenOneEmail] = useState({});

    const handleEmailDelete = useCallback(
      async (_id) => {
        switch (filterTrackerRef.current) {
          case messages.SHOW_ALL_INBOX:
            await deleteEmail(_id, user.email);
            break;
          case messages.SHOW_ALL_SENT:
            await deleteEmailSent(_id);
            break;

          default:
            break;
        }
        toast.success("Email Deleted!");

        filterEmailsViaId(_id);
      },
      [filterEmailsViaId, filterTrackerRef, user]
    );

    const handleStarEmail = useCallback(
      async (email, isStarred) => {
        let starredBy = email.starredBy || [];
        if (isStarred) {
          starredBy = starredBy.filter((s) => s !== user.email);
        } else {
          starredBy.push(user.email);
        }
        await updateEmail({ ...email, starredBy, updateingKey: "starredBy" });
        updatePerEmail("starredBy", starredBy, email._id);
        toast.success(isStarred ? "Email Unstarred!" : "Email Starred!");
      },
      [updatePerEmail, user.email]
    );

    const handleArchiveEmail = useCallback(
      async (email, isArchived) => {
        let archivedBy = email.archivedBy || [];

        if (isArchived) {
          archivedBy = archivedBy.filter((s) => s !== user.email);
        } else {
          archivedBy.push(user.email);
        }
        await updateEmail({ ...email, archivedBy, updateingKey: "archivedBy" });
        updatePerEmail("archivedBy", archivedBy, email._id);
        toast.success(isArchived ? "Email UnArchived!" : "Email Archived!");
      },
      [updatePerEmail, user.email]
    );

    const handleEmailOpen = useCallback(
      (e) => {
        navigate(`/email/${e._id}`);
      },
      [navigate]
    );
    const handleRefresh = (e) => fetchData(filterTrackerRef.current, true);

    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="email-container">
          <div className="filters-comp refresh-button">
            <IconButton
              onClick={() => fetchData(filterTrackerRef.current, true)}
            >
              <Tooltip title="Refresh">
                <RefreshIcon />
              </Tooltip>
            </IconButton>
          </div>

          <div className="all-email-container">
            {data.length === 0 ? (
              <motion.img
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                src={noRecorePlaceholder}
                alt=""
                height="50%"
                width="50%"
                style={{ alignSelf: "center" }}
              />
            ) : (
              <ul className="reset-all">
                {data.map((e) => {
                  const {
                    subject,
                    _id,
                    body,
                    starredBy,
                    archivedBy,
                    isUnread,
                    sender,
                  } = e || {};
                  return (
                    <li
                      key={_id}
                      className={
                        isUnread
                          ? `email-row unread reset-all`
                          : `reset-all email-row`
                      }
                    >
                      <div className="action-items-cont">
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={varient}
                        >
                          {starredBy.includes(user.email) ? (
                            <IconButton
                              sx={{ padding: "2px" }}
                              disableRipple
                              onClick={() => handleStarEmail(e, true)}
                            >
                              <Tooltip title="Mark As Unmportant">
                                <StarIcon color="warning" />
                              </Tooltip>
                            </IconButton>
                          ) : (
                            <IconButton
                              sx={{ padding: "2px" }}
                              disableRipple
                              onClick={() => handleStarEmail(e, false)}
                            >
                              <Tooltip title="Mark As Important">
                                <StarBorderIcon />
                              </Tooltip>
                            </IconButton>
                          )}
                        </motion.div>
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={varient}
                        >
                          {archivedBy.includes(user.email) ? (
                            <IconButton
                              sx={{ padding: "2px" }}
                              disableRipple
                              onClick={() => handleArchiveEmail(e, true)}
                            >
                              <Tooltip title="Unarchive">
                                <ArchiveIcon color="warning" />
                              </Tooltip>
                            </IconButton>
                          ) : (
                            <IconButton
                              sx={{ padding: "2px" }}
                              disableRipple
                              onClick={() => handleArchiveEmail(e, false)}
                            >
                              <Tooltip title="Archive">
                                <ArchiveIcon />
                              </Tooltip>
                            </IconButton>
                          )}
                        </motion.div>
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          variants={varient}
                        >
                          <IconButton
                            sx={{ padding: "2px" }}
                            disableRipple
                            onClick={async () => handleEmailDelete(_id)}
                          >
                            <Tooltip title="Delete">
                              <DeleteForeverIcon color="error" />
                            </Tooltip>
                          </IconButton>
                        </motion.div>
                      </div>

                      <motion.div
                        onClick={() => handleEmailOpen(e)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="sender-box"
                      >
                        {truncateText(sender, 15)}
                      </motion.div>
                      <div className="divider" />
                      <motion.div
                        onClick={() => handleEmailOpen(e)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="body-box"
                      >
                        <div
                          className="subject-box"
                          style={{ textWrap: "nowrap", fontWeight: "bold" }}
                        >
                          {truncateText(subject, 25)}
                        </div>
                        <div className="dash">-</div>
                        <div style={{ textWrap: "nowrap", opacity: "60%" }}>
                          {body}
                        </div>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </PullToRefresh>
    );
  }
);
CustomDataTable.displayName = "CustomDataTable";

// const CustomDataTableSkeletonLoader = ({ data = [1, 2, 3, 4, 5, 6] }) => {
//   return (
//     <div className="email-container">
//       <div className="filters-comp"></div>
//       <div className="all-email-container">
//         {data.map((_, i) => {
//           return (
//             <div key={i} className="email-row skeleton-row">
//               <Skeleton animation="wave" height={"100%"} width={"100%"} />
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };
export default MainContainer;
