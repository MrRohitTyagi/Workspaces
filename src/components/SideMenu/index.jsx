import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge, MenuItem, MenuList, Tooltip } from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";
import ArchiveIcon from "@mui/icons-material/Archive";
import FiberNewIcon from "@mui/icons-material/FiberNew";

import { emitEvent, emitter, listenToEvent } from "../../utils/eventemitter";
import "./sidemenu.css";

const sideMenuConfig = (emailcount) => [
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
    icon: (
      <Badge badgeContent={emailcount} color="primary">
        <AllInboxIcon />
      </Badge>
    ),
    navUrl: "/inbox",
  },
  {
    label: "Important",
    event: "SHOW_ALL_STARRED",
    tooltip: "Important",
    icon: <StarBorderIcon />,
    navUrl: "/star",
  },
  {
    label: "Sent",
    event: "SHOW_ALL_SENT",
    tooltip: "Sent",
    icon: <SendIcon />,
    navUrl: "/sent",
  },
  {
    label: "Archived",
    event: "SHOW_ALL_ARCHIVED",
    tooltip: "Archived",
    icon: <ArchiveIcon />,
    navUrl: "/archived",
  },
];

const varient = {
  hidden: { x: -100 },
  visible: { x: 0 },
};

const SideMenu = memo(() => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(1);
  const [isExpanded, setisExpanded] = useState(false);
  const [emailcount, setEmailcount] = useState(0);

  useEffect(() => {
    listenToEvent("EXPAND_COLLAPSE_SIDEBAR", () => setisExpanded((p) => !p));
    listenToEvent("INCREASE_NEW_EMAIL_COUNT", () =>
      setEmailcount((p) => p + 1)
    );

    return () => {
      emitter.off("EXPAND_COLLAPSE_SIDEBAR", () => {});
      emitter.off("INCREASE_NEW_EMAIL_COUNT", () => {});
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
        {sideMenuConfig(emailcount).map((menu, i) => {
          return (
            <MenuItem
              key={menu.label}
              sx={{
                padding: "15px",
                background: activeIndex === i ? "#c1c1c1" : "transparent",
              }}
              onClick={() => {
                if (i === 0) emitEvent(menu.event);
                else navigate(menu.navUrl);
                if (i !== 0) setActiveIndex(i);
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
