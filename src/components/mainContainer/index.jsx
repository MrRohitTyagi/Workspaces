import "./maincontainer.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { confugureUser } from "../../controllers/userController";
import "./customDataTable.css";
import { Checkbox, IconButton, Skeleton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { deleteEmail } from "../../controllers/emailController";
import { emitter, listenToEvent } from "../../utils/eventemitter";
const messages = {
  SHOW_ALL_INBOX: "SHOW_ALL_INBOX",
  SHOW_ALL_STARRED: "SHOW_ALL_STARRED",
  SHOW_ALL_SENT: "SHOW_ALL_SENT",
};
const MainContainer = () => {
  const { user } = useAuth0();
  const [emailData, setEmailData] = useState(undefined);
  const filterTrackerRef = useRef("");
  console.log(
    `%c emailData `,
    "color: yellow;border:1px solid lightgreen",
    emailData
  );
  const sortData = useCallback(
    (allEmails, filterKey) => {
      const emails = [];

      switch (filterKey) {
        case messages.SHOW_ALL_INBOX:
          for (const em of allEmails) {
            if (em.recipients.includes(user.email)) {
              emails.push(em);
            }
          }
          return emails;
        case messages.SHOW_ALL_SENT:
          for (const em of allEmails) {
            if (em.sender === user.email) {
              emails.push(em);
            }
          }
          return emails;

        case messages.SHOW_ALL_STARRED:
          for (const em of allEmails) {
            if (em.starredBy.includes(user.email)) {
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
    async (filterType, forcerefresh = false) => {
      if (filterType === filterTrackerRef.current && !forcerefresh) return;
      filterTrackerRef.current = filterType;
      setEmailData(undefined);
      const { response } = await confugureUser(user.name, user.email);
      const data = sortData(response?.emailContent || [], filterType);
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

  const filterEmailsViaId = useCallback((_id) => {
    setEmailData((prev) => prev.filter((e) => e._id !== _id));
  }, []);

  const changeKey = useCallback((_id, key, value) => {
    setEmailData((prev) =>
      prev.map((e) => {
        if (e._id === _id) {
          e[key] = value;
          return e;
        } else return e;
      })
    );
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

    return () => {
      emitter.off(messages.SHOW_ALL_INBOX, () => {});
      emitter.off(messages.SHOW_ALL_STARRED, () => {});
      emitter.off(messages.SHOW_ALL_SENT, () => {});
    };
  }, [fetchData]);

  return (
    <motion.div className="main-email-container">
      {emailData === undefined ? (
        <CustomDataTableSkeletonLoader />
      ) : emailData.length === 0 ? (
        <>No Data</>
      ) : (
        // <DataTable data={emailData} columns={columns} />
        <CustomDataTable
          changeKey={changeKey}
          data={emailData || []}
          fetchData={fetchData}
          filterEmailsViaId={filterEmailsViaId}
          user={user}
          filterTrackerRef={filterTrackerRef}
        />
      )}
    </motion.div>
  );
};

const CustomDataTable = ({
  data = [],
  fetchData,
  user,
  filterEmailsViaId,
  changeKey,
  filterTrackerRef,
}) => {
  return (
    <div className="email-container">
      <div className="filters-comp">
        <IconButton onClick={() => fetchData(filterTrackerRef.current, true)}>
          <RefreshIcon />
        </IconButton>
      </div>
      <div className="all-email-container">
        {data.map(({ subject, _id, body, isStarred }) => {
          return (
            <div key={_id} className="email-row">
              <div className="">
                <Checkbox size="small" />
                <IconButton
                  sx={{ padding: "2px" }}
                  disableRipple
                  changeKey={() => changeKey(_id, isStarred, !isStarred)}
                >
                  <StarBorderIcon />
                </IconButton>
                <IconButton
                  sx={{ padding: "2px" }}
                  disableRipple
                  onClick={async () => {
                    filterEmailsViaId(_id);
                    deleteEmail(_id, user.email);
                  }}
                >
                  <DeleteForeverIcon color="error" />
                </IconButton>
              </div>
              <motion.div
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="body-box"
              >
                {body}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
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
