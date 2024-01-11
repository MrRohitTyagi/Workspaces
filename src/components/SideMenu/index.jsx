import { memo, useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

import { Badge, Divider, MenuItem, MenuList, Tooltip } from "@mui/material";
import AllInboxIcon from "@mui/icons-material/AllInbox";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";
import ArchiveIcon from "@mui/icons-material/Archive";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import ChatIcon from "@mui/icons-material/Chat";

import { emitEvent, emitter, listenToEvent } from "@/utils/eventemitter";

import { ThemeTypeContext } from "@/App";
import "./sidemenu.css";
import { socket } from "../authorizeUser";
import MobileAppMenu from "./MobileAPpMenu";
import useWindowDimens from "@/utils/useWindowDimens";
import GroupsIcon from "@mui/icons-material/Groups";

export const sideMenuConfig = (isDarkTheme, emailcount) => [
  {
    label: "Componse",
    event: "ADD_NEW_EMAIL",
    tooltip: "Send new email",
    icon: <FiberNewIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />,
  },
  {
    label: "Inbox",
    event: "SHOW_ALL_INBOX",
    tooltip: "Inbox",
    icon: (
      <Badge badgeContent={emailcount} color="primary">
        <AllInboxIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />
      </Badge>
    ),
    navUrl: "/inbox",
  },
  {
    label: "Important",
    event: "SHOW_ALL_STARRED",
    tooltip: "Important",
    icon: <StarBorderIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />,
    navUrl: "/star",
  },
  {
    label: "Sent",
    event: "SHOW_ALL_SENT",
    tooltip: "Sent",
    icon: <SendIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />,
    navUrl: "/sent",
  },
  {
    label: "Archived",
    event: "SHOW_ALL_ARCHIVED",
    tooltip: "Archived",
    icon: <ArchiveIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />,
    navUrl: "/archived",
  },
];
export const chatMEnuConfig = (isDarkTheme) => {
  return [
    {
      label: "Chats",
      tooltip: "Chats",
      icon: <ChatIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />,
      navUrl: "/chats/select",
    },
    {
      // isDisabled: true,
      label: "Groups",
      tooltip: "Groups",
      icon: <GroupsIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />,
      navUrl: "/groups/select",
    },
  ];
};
const varient = {
  hidden: { x: -100 },
  visible: { x: 0 },
};

const SideMenu = memo(() => {
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [activeIndex, setActiveIndex] = useState(pathname);
  const [hideAppMenu, sethideAppMenu] = useState(false);

  const [isExpanded, setisExpanded] = useState(false);

  const [emailcount, setEmailcount] = useState(0);

  useEffect(() => {
    listenToEvent("EXPAND_COLLAPSE_SIDEBAR", () => setisExpanded((p) => !p));
    listenToEvent("INCREASE_NEW_EMAIL_COUNT", () =>
      setEmailcount((p) => p + 1)
    );
    listenToEvent("HIDE_APP_BAR", () => sethideAppMenu((p) => !p));

    return () => {
      emitter.off("EXPAND_COLLAPSE_SIDEBAR", () => {});
      emitter.off("INCREASE_NEW_EMAIL_COUNT", () => {});
      emitter.off("HIDE_APP_BAR", () => {});
    };
  }, []);

  useEffect(() => {
    // Listen for messages from the server
    socket.on("NEW_MESSAGE_RECEIVED", () => {
    });
  }, []);

  const innerWidth = useWindowDimens();
  if (innerWidth < 750) {
    return hideAppMenu ? <></> : <MobileAppMenu />;
  } else
    return (
      <div
        style={{
          width: isExpanded ? "12rem" : "4rem",
        }}
        className={`side-menu-container ${
          isDarkTheme ? "side-menu-container-dark" : ""
        }`}
      >
        <MenuList className="side-menu-icon-container">
          {sideMenuConfig(isDarkTheme, emailcount).map((menu, i) => {
            return (
              <MenuItem
                className="menu-item-mui"
                key={menu.label}
                sx={{
                  ":hover": {
                    background: "initial",
                  },
                  padding: "15px",
                  background:
                    activeIndex === menu.navUrl
                      ? isDarkTheme
                        ? "#313131"
                        : "#c1c1c1"
                      : "transparent",
                }}
                onClick={() => {
                  if (i === 0) emitEvent(menu.event);
                  else navigate(menu.navUrl);
                  if (i !== 0) {
                    if (activeIndex !== menu.navUrl)
                      setActiveIndex(menu.navUrl);
                  }
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
                  {isExpanded && (
                    <h4 className={isDarkTheme ? "l-t-svg" : "d-t-svg"}>
                      {menu.label}
                    </h4>
                  )}
                </div>
              </MenuItem>
            );
          })}
          <Divider
            orientation="horizontal"
            sx={{ borderBottomWidth: "thick" }}
            className="inbox-chat-divider"
          />
          {chatMEnuConfig(isDarkTheme).map((menu) => (
            <MenuItem
              disabled={menu.isDisabled}
              key={menu.label}
              sx={{
                padding: "15px",
                background:
                  activeIndex === menu.navUrl
                    ? isDarkTheme
                      ? "#313131"
                      : "#c1c1c1"
                    : "transparent",
              }}
              onClick={() => {
                if (activeIndex !== menu.navUrl) {
                  setActiveIndex(menu.navUrl);
                }
                navigate(menu.navUrl);
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
                {isExpanded && (
                  <h4 className={isDarkTheme ? "l-t-svg" : "d-t-svg"}>
                    {menu.label}
                  </h4>
                )}
              </div>
            </MenuItem>
          ))}
        </MenuList>
      </div>
    );
});

SideMenu.displayName = "SideMenu";
export default SideMenu;
