import { useCallback, useEffect, useState } from "react";
import "./componeEmail.css";
import { listenToEvent, emitter } from "../../utils/eventemitter";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NewEmail from "./EmailDialogue";
import { v4 } from "uuid";
import { useSelector } from "react-redux";

const ComposeEmail = () => {
  const user = useSelector(({ user }) => user);

  const [newEmailCount, setnewEmailCount] = useState([]);
  useEffect(() => {
    listenToEvent("ADD_NEW_EMAIL", () => {
      setnewEmailCount((p) => {
        if (p.length === 5) return p;
        return [...p, { id: v4() }];
      });
    });

    return () => {
      emitter.off("ADD_NEW_EMAIL");
    };
  }, []);
  const filterEmails = useCallback((id) => {
    setnewEmailCount((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <div className="new-email-container">
      {newEmailCount.map((e, i) => (
        <OneEmailBox
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

const OneEmailBox = ({ email, index, filterEmails, user }) => {
  const [isOpen, setisOpen] = useState(true);
  return (
    <div
      className="new-email-box"
      onClick={(e) => {
        e.stopPropagation();
        setisOpen(true);
      }}
      style={{ backgroundColor: isOpen ? "#dfdfdf" : "white" }}
    >
      <div className="new-header">
        <div className="txt">New Message</div>
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
          user={user}
          filterEmails={filterEmails}
          email={email}
          index={index}
          open={isOpen}
          setOpen={setisOpen}
        />
      )}
    </div>
  );
};

export default ComposeEmail;
