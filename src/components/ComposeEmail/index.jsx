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
  const { user }  =useAuth();

  const [newEmailCount, setNewEmailCount] = useState([]);

  useEffect(() => {
    listenToEvent("ADD_NEW_EMAIL", () => {
      setNewEmailCount((p) => {
        if (p.length === 5) return p;
        return [...p, { id: v4(), to: "", subject: "", body: "" }];
      });
    });

    return () => {
      emitter.off("ADD_NEW_EMAIL");
    };
  }, []);

  const filterEmails = useCallback((id) => {
    setNewEmailCount((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <div className="new-email-container">
      {newEmailCount.map((e, i) => (
        <OneEmailBox
          setNewEmailCount={setNewEmailCount}
          user={user}
          key={i}
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
  const [isOpen, setIsOpen] = useState(true);
  console.log("isOpen", isOpen);
  const closeLayer = () => setIsOpen(false);
  return (
    <div
      className="new-email-box"
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(true);
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
          closeLayer={closeLayer}
        />
      )}
    </div>
  );
};

export default ComposeEmail;
