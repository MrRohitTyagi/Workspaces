import { useEffect, useState } from "react";
import "./sidemenu.css";
import { listenToEvent } from "../../utils/eventemitter";
import { MenuItem, MenuList } from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import TypingEffect from "../typingeffect/TypingEffect";

const menuStyles = {
  padding: "15px",
};

const SideMenu = () => {
  const [isExpanded, setisExpanded] = useState(false);
  useEffect(() => {
    listenToEvent("EXPAND_COLLAPSE_SIDEBAR", () => setisExpanded((p) => !p));

    return () => {
      // emitter.off("SOME_EVENT", eventListener);
    };
  }, []);

  return (
    <div
      style={{
        width: isExpanded ? "15rem" : "5rem",
      }}
      className="side-menu-container"
    >
      <MenuList>
        <MenuItem sx={menuStyles}>
          <div className="menu-item">
            <AllInboxIcon />
            {isExpanded && (
              <TypingEffect text={"Inbox"} time={50}></TypingEffect>
            )}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles}>
          <div className="menu-item">
            <StarBorderIcon />
            {isExpanded && (
              <TypingEffect text={"Starred"} time={50}></TypingEffect>
            )}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles}>
          <div className="menu-item">
            <SendIcon />
            {isExpanded && (
              <TypingEffect text={"Sent"} time={50}></TypingEffect>
            )}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles}>
          <div className="menu-item">
            <LabelImportantIcon />
            {isExpanded && (
              <TypingEffect text={"Important"} time={50}></TypingEffect>
            )}
          </div>
        </MenuItem>
      </MenuList>
    </div>
  );
};

export default SideMenu;
