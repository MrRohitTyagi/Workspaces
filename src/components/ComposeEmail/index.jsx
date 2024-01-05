import { useCallback, useEffect, useState } from "react";
import { v4 } from "uuid";
import PropTypes from "prop-types";

import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import NewEmail from "./EmailDialogue";
import useAuth from "@/utils/useAuth";
import { listenToEvent, emitter } from "@/utils/eventemitter";
import "./componeEmail.css";

const ComposeEmail = () => {
  const { user } = useAuth();

  const [newEmailsTOSend, setNewEmailsToSend] = useState([]);

  useEffect(() => {
    listenToEvent("ADD_NEW_EMAIL", (data) => {
      setNewEmailsToSend((p) => {
        if (p.length === 5) return p;
        return [
          ...p,
          { id: v4(), to: [], subject: "", body: "", isOpen: true, ...data },
        ];
      });
    });

    return () => {
      emitter.off("ADD_NEW_EMAIL");
    };
  }, []);

  const filterEmails = useCallback((id) => {
    setNewEmailsToSend((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <div className="new-email-container">
      {newEmailsTOSend.map((e, i) => (
        <OneEmailBox
          setNewEmailsToSend={setNewEmailsToSend}
          user={user}
          key={i + e.id + e.isOpen}
          email={e}
          index={i}
          filterEmails={filterEmails}
        />
      ))}
    </div>
  );
};

const OneEmailBox = ({
  email,
  index,
  filterEmails,
  user,
  setNewEmailsToSend,
}) => {
  const handleEmailOpen = useCallback(
    (id) => {
      setNewEmailsToSend((prev) => {
        let arr = [];
        for (let i = 0; i < prev.length; i++) {
          const perEmail = prev[i];
          if (perEmail.id === id) {
            arr.push({ ...perEmail, isOpen: true });
          } else {
            arr.push(perEmail);
          }
        }
        return [...arr];
      });
    },
    [setNewEmailsToSend]
  );

  const isOpen = email.isOpen;
  return (
    <div
      className="new-email-box"
      onClick={() => {
        handleEmailOpen(email.id);
      }}
      style={{ backgroundColor: isOpen ? "#dfdfdf" : "white" }}
    >
      <div className="new-header">
        <div className="txt">
          {`${email.subject}`.slice(0, 10) || "New Message"}...
        </div>
      </div>
      <div className="new-e-buttons">
        <IconButton
          sx={{ padding: "2px" }}
          onClick={(e) => {
            e.stopPropagation();
            filterEmails(email.id);
          }}
        >
          <CloseIcon />
        </IconButton>
        <IconButton sx={{ padding: "1px" }}>
          {isOpen ? (
            <ExpandLessIcon fontSize="large" />
          ) : (
            <ExpandMoreIcon fontSize="large" />
          )}
        </IconButton>
      </div>
      {isOpen && (
        <NewEmail
          setNewEmailsToSend={setNewEmailsToSend}
          user={user}
          filterEmails={filterEmails}
          email={email}
          index={index}
          open={isOpen}
        />
      )}
    </div>
  );
};
OneEmailBox.propTypes = {
  email: PropTypes.object,
  index: PropTypes.number,
  filterEmails: PropTypes.func,
  user: PropTypes.object,
  setNewEmailsToSend: PropTypes.func,
};

export default ComposeEmail;
