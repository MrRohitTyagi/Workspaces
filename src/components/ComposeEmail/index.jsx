/* eslint-disable react/prop-types */
import { memo, useCallback, useEffect, useState } from "react";
import "./componeEmail.css";
import { listenToEvent, emitter } from "../../utils/eventemitter";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NewEmail from "./EmailDialogue";
import { v4 } from "uuid";
import useAuth from "../../utils/useAuth";

const ComposeEmail = () => {
  const { user } = useAuth();

  const [newEmailCount, setNewEmailCount] = useState([]);

  useEffect(() => {
    listenToEvent("ADD_NEW_EMAIL", () => {
      setNewEmailCount((p) => {
        if (p.length === 5) return p;
        return [
          ...p,
          { id: v4(), to: "", subject: "", body: "", isOpen: true },
        ];
      });
    });

    return () => {
      emitter.off("ADD_NEW_EMAIL");
    };
  }, []);

  const filterEmails = useCallback((id) => {
    setNewEmailCount((prev) => prev.filter((e) => e.id !== id));
  }, []);

  console.log(
    `%c newEmailCount `,
    "color: #dada00;border:1px solid lightgreen",
    newEmailCount
  );
  return (
    <div className="new-email-container">
      {newEmailCount.map((e, i) => (
        <OneEmailBox
          setNewEmailCount={setNewEmailCount}
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
  setNewEmailCount,
}) => {
  const handleEmailOpen = useCallback(
    (id) => {
      setNewEmailCount((prev) => {
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
    [setNewEmailCount]
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
          setNewEmailCount={setNewEmailCount}
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

export default ComposeEmail;
