/* eslint-disable react/prop-types */
import "./maincontainer.css";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { confugureUser } from "../../controllers/userController";
import "./customDataTable.css";
import { IconButton, Skeleton, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { toast } from "react-toastify";
import {
  deleteEmail,
  deleteEmailSent,
  updateEmail,
} from "../../controllers/emailController";
import { emitter, listenToEvent } from "../../utils/eventemitter";
import noRecorePlaceholder from "../../assets/noRecored-placeholder.png";
import { socket } from "../../App";
import PerEmailScreen from "../perEmailScreen";

const messages = {
  SHOW_ALL_INBOX: "SHOW_ALL_INBOX",
  SHOW_ALL_STARRED: "SHOW_ALL_STARRED",
  SHOW_ALL_SENT: "SHOW_ALL_SENT",
  SHOW_ALL_ARCHIVED: "SHOW_ALL_ARCHIVED",
  GLOBAL_SEARCH_QUERY: "GLOBAL_SEARCH_QUERY",
};
const MainContainer = () => {
  const { user } = useAuth0();
  const [emailData, setEmailData] = useState(undefined);
  const filterTrackerRef = useRef("");
  const sortData = useCallback(
    (allEmails, filterKey, globalQuery = "") => {
      const emails = [];

      switch (filterKey) {
        case messages.SHOW_ALL_INBOX:
          for (const em of allEmails) {
            const isArchived = em.archivedBy.includes(user.email);
            if (em.recipients.includes(user.email) && !isArchived) {
              emails.push(em);
            }
          }
          return emails;
        case messages.SHOW_ALL_SENT:
          for (const em of allEmails) {
            const isArchived = em.archivedBy.includes(user.email);
            if (em.sender === user.email && !isArchived) {
              emails.push(em);
            }
          }
          return emails;

        case messages.SHOW_ALL_STARRED:
          for (const em of allEmails) {
            const isArchived = em.archivedBy.includes(user.email);
            if (em.starredBy.includes(user.email) && !isArchived) {
              emails.push(em);
            }
          }
          return emails;
        case messages.SHOW_ALL_ARCHIVED:
          for (const em of allEmails) {
            if (em.archivedBy.includes(user.email)) {
              emails.push(em);
            }
          }
          return emails;
        case messages.GLOBAL_SEARCH_QUERY:
          for (const em of allEmails) {
            if (em.sender.includes(globalQuery)) {
              emails.push(em);
            }
          }
          return emails;

        default:
          return emails;
      }
    },
    [user]
  );

  const fetchData = useCallback(
    async (filterType, forcerefresh = false, globalQuery) => {
      if (filterType === filterTrackerRef.current && !forcerefresh) return;
      filterTrackerRef.current = filterType;
      setEmailData(undefined);
      const { response } = await confugureUser(user.name, user.email);
      const data = sortData(
        response?.emailContent || [],
        filterType,
        globalQuery
      );
      setEmailData(data);
    },
    [sortData, user.email, user.name]
  );

  useEffect(() => {
    (async function fetchUser() {
      if (user) {
        fetchData(messages.SHOW_ALL_INBOX);
      }
    })();
  }, [fetchData, sortData, user]);

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
        <CustomDataTableSkeletonLoader />
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
    const [openOneEmail, setOpenOneEmail] = useState({});
    const handleEmailDelete = async (_id, email) => {
      switch (filterTrackerRef.current) {
        case messages.SHOW_ALL_INBOX:
          await deleteEmail(_id, email);
          break;
        case messages.SHOW_ALL_SENT:
          await deleteEmailSent(_id);
          break;

        default:
          break;
      }
      toast.success("Email Deleted!");

      filterEmailsViaId(_id);
    };

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
    const handleEmailOpen = useCallback((e) => {
      setOpenOneEmail(e);
    }, []);

    if (openOneEmail._id) {
      return (
        <PerEmailScreen
          email={openOneEmail}
          setOpenOneEmail={setOpenOneEmail}
        />
      );
    }

    return (
      <div className="email-container">
        <div className="filters-comp">
          <IconButton onClick={() => fetchData(filterTrackerRef.current, true)}>
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
            data.map((e) => {
              const { subject, _id, body, starredBy, archivedBy, isUnread } =
                e || {};
              return (
                <div
                  key={_id}
                  className={isUnread ? `email-row unread` : `email-row`}
                >
                  <div style={{ gap: "5px" }}>
                    {/* <Checkbox size="small" /> */}

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

                    {/* //ARCHIVED  */}

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
                    <IconButton
                      sx={{ padding: "2px" }}
                      disableRipple
                      onClick={async () => handleEmailDelete(_id, user.email)}
                    >
                      <Tooltip title="Delete">
                        <DeleteForeverIcon color="error" />
                      </Tooltip>
                    </IconButton>
                  </div>
                  <motion.div
                    onClick={() => handleEmailOpen(e)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="subject-box"
                  >
                    {subject?.slice(0, 15)}
                    {subject?.length > 15 ? "..." : ""}
                  </motion.div>
                  <div className="divider" />
                  <motion.div
                    onClick={() => handleEmailOpen(e)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="body-box"
                  >
                    {body}
                  </motion.div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
);
CustomDataTable.displayName = "CustomDataTable";

const CustomDataTableSkeletonLoader = ({ data = [1, 2, 3, 4, 5, 6] }) => {
  return (
    <div className="email-container">
      <div className="filters-comp"></div>
      <div className="all-email-container">
        {data.map((_, i) => {
          return (
            <div key={i} className="email-row skeleton-row">
              <Skeleton animation="wave" height={"100%"} width={"100%"} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MainContainer;
