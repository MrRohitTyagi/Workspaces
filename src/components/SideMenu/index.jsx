import { memo, useEffect, useState } from "react";
import "./sidemenu.css";
import { emitEvent, listenToEvent } from "../../utils/eventemitter";
import { MenuItem, MenuList } from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";
import LabelImportantIcon from "@mui/icons-material/LabelImportant";
import TypingEffect from "../typingeffect/TypingEffect";
import FiberNewIcon from "@mui/icons-material/FiberNew";
const menuStyles = {
  padding: "15px",
};

const SideMenu = memo(() => {
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
        width: isExpanded ? "12rem" : "4rem",
      }}
      className="side-menu-container"
    >
      <MenuList>
        <MenuItem sx={menuStyles} onClick={() => emitEvent("ADD_NEW_EMAIL")}>
          <div className="menu-item">
            <FiberNewIcon />
            {isExpanded && <h4>Componse</h4>}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles}>
          <div className="menu-item">
            <AllInboxIcon />
            {isExpanded && <h4>Inbox</h4>}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles}>
          <div className="menu-item">
            <StarBorderIcon />
            {isExpanded && <h4>Starred</h4>}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles}>
          <div className="menu-item">
            <SendIcon />
            {isExpanded && <h4>Sent</h4>}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles}>
          <div className="menu-item">
            <LabelImportantIcon />
            {isExpanded && <h4>Important</h4>}
          </div>
        </MenuItem>
      </MenuList>
    </div>
  );
});

SideMenu.displayName = "SideMenu";
export default SideMenu;
