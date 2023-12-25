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
            {isExpanded && (
              <TypingEffect
                text={"Componse"}
                time={50}
                style={{
                  border: "1px solid black",
                  borderRadius: "3px",
                  padding: "3px 5px",
                }}
              ></TypingEffect>
            )}
          </div>
        </MenuItem>
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
});

SideMenu.displayName = "SideMenu";
export default SideMenu;
