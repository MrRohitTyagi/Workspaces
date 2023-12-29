import { memo, useEffect, useState } from "react";
import "./sidemenu.css";
import { emitEvent, listenToEvent } from "../../utils/eventemitter";
import { MenuItem, MenuList, Tooltip } from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";
import ArchiveIcon from "@mui/icons-material/Archive";
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
            <Tooltip title="Send new email">
              <FiberNewIcon />
            </Tooltip>
            {isExpanded && <h4>Componse</h4>}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles} onClick={() => emitEvent("SHOW_ALL_INBOX")}>
          <div className="menu-item">
            <Tooltip title="Inbox">
              <AllInboxIcon />
            </Tooltip>

            {isExpanded && <h4>Inbox</h4>}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles} onClick={() => emitEvent("SHOW_ALL_STARRED")}>
          <div className="menu-item">
            <Tooltip title="Important">
              <StarBorderIcon />
            </Tooltip>
            {isExpanded && <h4>Starred</h4>}
          </div>
        </MenuItem>
        <MenuItem sx={menuStyles} onClick={() => emitEvent("SHOW_ALL_SENT")}>
          <div className="menu-item">
            <Tooltip title="Sent">
              <SendIcon />
            </Tooltip>
            {isExpanded && <h4>Sent</h4>}
          </div>
        </MenuItem>
        <MenuItem
          sx={menuStyles}
          onClick={() => emitEvent("SHOW_ALL_ARCHIVED")}
        >
          <div className="menu-item">
            <Tooltip title="Archived">
              <ArchiveIcon />
            </Tooltip>
            {isExpanded && <h4>Important</h4>}
          </div>
        </MenuItem>
      </MenuList>
    </div>
  );
});

SideMenu.displayName = "SideMenu";
export default SideMenu;
