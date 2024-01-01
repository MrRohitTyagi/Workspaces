import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MenuItem, MenuList, Tooltip } from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";
import ArchiveIcon from "@mui/icons-material/Archive";
import FiberNewIcon from "@mui/icons-material/FiberNew";

import { emitEvent, emitter, listenToEvent } from "../../utils/eventemitter";
import "./sidemenu.css";

const sideMenuConfig = [
  {
    label: "Componse",
    event: "ADD_NEW_EMAIL",
    tooltip: "Send new email",
    icon: <FiberNewIcon />,
  },
  {
    label: "Inbox",
    event: "SHOW_ALL_INBOX",
    tooltip: "Inbox",
    icon: <AllInboxIcon />,
  },
  {
    label: "Important",
    event: "SHOW_ALL_STARRED",
    tooltip: "Important",
    icon: <StarBorderIcon />,
  },
  {
    label: "Sent",
    event: "SHOW_ALL_SENT",
    tooltip: "Sent",
    icon: <SendIcon />,
  },
  {
    label: "Archived",
    event: "SHOW_ALL_ARCHIVED",
    tooltip: "Archived",
    icon: <ArchiveIcon />,
  },
];

const varient = {
  hidden: { x: -100 },
  visible: { x: 0 },
};

const SideMenu = memo(() => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(1);
  const [isExpanded, setisExpanded] = useState(false);
  useEffect(() => {
    listenToEvent("EXPAND_COLLAPSE_SIDEBAR", () => setisExpanded((p) => !p));

    return () => {
      emitter.off("EXPAND_COLLAPSE_SIDEBAR", () => {});
    };
  }, []);

  return (
    <div
      style={{
        zIndex: 100,
        width: isExpanded ? "12rem" : "4rem",
      }}
      className="side-menu-container"
    >
      <MenuList className="side-menu-icon-container">
        {sideMenuConfig.map((menu, i) => {
          return (
            <MenuItem
              key={menu.label}
              sx={{
                padding: "15px",
                background: isActive === i ? "#c1c1c1" : "transparent",
              }}
              onClick={() => {
                // navigate(`/`);
                emitEvent(menu.event);
                if (i === 0) return;
                setIsActive(i);
              }}
            >
              <div className="menu-item">
                <Tooltip title={menu.tooltip}>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={varient}
                  >
                    {menu.icon}
                  </motion.div>
                </Tooltip>
                {isExpanded && <h4>{menu.label}</h4>}
              </div>
            </MenuItem>
          );
        })}
      </MenuList>
    </div>
  );
});

SideMenu.displayName = "SideMenu";
export default SideMenu;
