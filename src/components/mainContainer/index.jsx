import { isEmpty } from "lodash";
import { toast } from "react-toastify";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import PullToRefresh from "react-simple-pull-to-refresh";
import { useLocation, useNavigate } from "react-router-dom";

import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import {
  deleteEmail,
  deleteEmailSent,
  updateEmail,
} from "@/controllers/emailController";

import noRecorePlaceholder from "@/assets/noRecored-placeholder.png";

import { truncateText } from "@/utils/helperFunctions";
import useAuth from "@/utils/useAuth";
import { emitter, listenToEvent } from "@/utils/eventemitter";

import "./customDataTable.css";
import "./maincontainer.css";

import { socket } from "@/components/authorizeUser";
import Loader from "@/components/Loader";
import { ThemeTypeContext } from "@/App";

import { confugureUser } from "@/controllers/userController";

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
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const { user } = useAuth();
  const [emailData, setEmailData] = useState(undefined);
  const filterTrackerRef = useRef(filterObjs[pathname]);

  const fetchData = useCallback(
    async (filterType, globalQuery) => {
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
      emitter.emit("INCREASE_NEW_EMAIL_COUNT");
      setEmailData((prev) => [email, ...prev]);
    });
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
      fetchData(messages.GLOBAL_SEARCH_QUERY, txt);
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
    <motion.div
      className={`main-email-container ${
        isDarkTheme ? "main-email-container-dark" : ""
      }`}
    >
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
    const [actionItemClick, setactionItemClick] = useState({});

    const handleStartloading = useCallback((_id, key) => {
      setactionItemClick((p) => {
        let obj = { ...p };
        obj[_id] = { ...(obj[_id] || {}), [key]: true };
        return obj;
      });
    }, []);

    const handleCloseloading = useCallback((_id, key) => {
      try {
        setactionItemClick((p) => {
          let obj = { ...p };
          delete obj[_id][key];
          if (isEmpty(obj[_id])) {
            delete obj[_id];
          }
          return obj;
        });
      } catch (error) {
        console.log("error", error);
      }
    }, []);
    const handleEmailDelete = useCallback(
      async (_id) => {
        handleStartloading(_id, "delete");

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

        handleCloseloading(_id, "delete");
        filterEmailsViaId(_id);
      },
      [
        filterEmailsViaId,
        filterTrackerRef,
        handleCloseloading,
        handleStartloading,
        user.email,
      ]
    );

    const handleStarEmail = useCallback(
      async (email, isStarred) => {
        handleStartloading(email._id, "star");

        let starredBy = email.starredBy || [];
        if (isStarred) {
          starredBy = starredBy.filter((s) => s !== user.email);
        } else {
          starredBy.push(user.email);
        }
        await updateEmail({ ...email, starredBy, updateingKey: "starredBy" });
        updatePerEmail("starredBy", starredBy, email._id);
        toast.success(isStarred ? "Email Unstarred!" : "Email Starred!");
        handleCloseloading(email._id, "star");
      },
      [handleCloseloading, handleStartloading, updatePerEmail, user.email]
    );

    const handleArchiveEmail = useCallback(
      async (email, isArchived) => {
        // setactionItemClick((p) => ({ ...p, archive: email._id }));
        handleStartloading(email._id, "archive");
        let archivedBy = email.archivedBy || [];

        if (isArchived) {
          archivedBy = archivedBy.filter((s) => s !== user.email);
        } else {
          archivedBy.push(user.email);
        }
        await updateEmail({ ...email, archivedBy, updateingKey: "archivedBy" });
        updatePerEmail("archivedBy", archivedBy, email._id);
        toast.success(isArchived ? "Email UnArchived!" : "Email Archived!");

        handleCloseloading(email._id, "archive");
      },
      [handleCloseloading, handleStartloading, updatePerEmail, user.email]
    );

    const handleEmailOpen = useCallback(
      (e) => {
        navigate(`/email/${e._id}`);
      },
      [navigate]
    );
    const handleRefresh = () => fetchData(filterTrackerRef.current);

    const { isDarkTheme } = useContext(ThemeTypeContext);

    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="email-container">
          <div className="filters-comp refresh-button">
            <IconButton onClick={() => fetchData(filterTrackerRef.current)}>
              <Tooltip title="Refresh">
                <RefreshIcon className={`${isDarkTheme ? "l-t-svg" : ""}`} />
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
                {data?.map((e) => {
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
                        {actionItemClick?.[_id]?.star ? (
                          <IconButton
                            size="small"
                            sx={{ padding: "2px" }}
                            disableRipple
                          >
                            <CircularProgress size={"small"} />
                          </IconButton>
                        ) : (
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
                                  <StarIcon
                                    color="warning"
                                    className={`${
                                      isDarkTheme ? "l-t-svg" : ""
                                    }`}
                                  />
                                </Tooltip>
                              </IconButton>
                            ) : (
                              <IconButton
                                sx={{ padding: "2px" }}
                                disableRipple
                                onClick={() => handleStarEmail(e, false)}
                              >
                                <Tooltip title="Mark As Important">
                                  <StarBorderIcon
                                    className={`${
                                      isDarkTheme ? "l-t-svg" : ""
                                    }`}
                                  />
                                </Tooltip>
                              </IconButton>
                            )}
                          </motion.div>
                        )}

                        {actionItemClick?.[_id]?.archive ? (
                          <IconButton
                            size="small"
                            sx={{ padding: "2px" }}
                            disableRipple
                          >
                            <CircularProgress
                              size={"small"}
                              className={`${isDarkTheme ? "l-t-svg" : ""}`}
                            />
                          </IconButton>
                        ) : (
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
                                  <ArchiveIcon
                                    color="warning"
                                    className={`${
                                      isDarkTheme ? "l-t-svg" : ""
                                    }`}
                                  />
                                </Tooltip>
                              </IconButton>
                            ) : (
                              <IconButton
                                sx={{ padding: "2px" }}
                                disableRipple
                                onClick={() => handleArchiveEmail(e, false)}
                              >
                                <Tooltip title="Archive">
                                  <ArchiveIcon
                                    className={`${
                                      isDarkTheme ? "l-t-svg" : ""
                                    }`}
                                  />
                                </Tooltip>
                              </IconButton>
                            )}
                          </motion.div>
                        )}

                        {actionItemClick?.[_id]?.delete ? (
                          <IconButton
                            size="small"
                            sx={{ padding: "2px" }}
                            disableRipple
                          >
                            <CircularProgress
                              size={"small"}
                              className={`${isDarkTheme ? "l-t-svg" : ""}`}
                            />
                          </IconButton>
                        ) : (
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
                                <DeleteForeverIcon
                                  color="error"
                                  className={`${isDarkTheme ? "l-t-svg" : ""}`}
                                />
                              </Tooltip>
                            </IconButton>
                          </motion.div>
                        )}
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

CustomDataTable.propTypes = {
  data: PropTypes.any,
  fetchData: PropTypes.func,
  user: PropTypes.object,
  filterEmailsViaId: PropTypes.func,
  filterTrackerRef: PropTypes.object,
  updatePerEmail: PropTypes.func,
};

export default MainContainer;
