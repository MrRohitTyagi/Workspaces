/* eslint-disable react/prop-types */
import { memo, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import AsyncSelect from "react-select/async";

import Button from "@mui/material/Button";
import { Avatar, Badge, IconButton, MenuItem, MenuList } from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { Close } from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import useAuth from "@/utils/useAuth";
import { emitter, listenToEvent } from "@/utils/eventemitter";

import { searchEmail } from "@/controllers/emailController";
import { ThemeTypeContext } from "@/App";

import "./chatSideMenuStyles.css";

const popperProps = {
  elevation: 0,
  sx: {
    overflow: "visible",
    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
    mt: 1.5,
    "&::before": {
      content: '""',
      display: "block",
      position: "absolute",
      top: 8,
      left: -4,
      width: 10,
      height: 10,
      bgcolor: "background.paper",
      transform: "translateY(-50%) rotate(45deg)",
      zIndex: 0,
    },
  },
};

const ChatSideMenu = ({ allChats, setAllChats }) => {
  const [isEmpanded, setIsEmpanded] = useState(false);
  const { ...params } = useParams();
  const message_id = params?.["*"];

  const { user } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const [activeUser, setActiveUser] = useState(message_id || null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveUser(message_id);
  }, [message_id]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    function closeLayer() {
      setAnchorEl(null);
    }
    listenToEvent("CLOSE_ADD_NEW_CHAT_POPUP", closeLayer);
    return () => {
      emitter.off("CLOSE_ADD_NEW_CHAT_POPUP", closeLayer);
    };
  }, []);

  const clearNewMessageCountOnClick = useCallback(
    (_id) => {
      let haveNewMessage = false;
      setAllChats((prev) => {
        const chatArr = [];
        for (const chat of prev) {
          if (chat._id === _id && chat.newMsgCount > 0) {
            haveNewMessage = true;
            chatArr.push({ ...chat, newMsgCount: 0 });
          } else chatArr.push(chat);
        }
        if (haveNewMessage) return chatArr;
        else return prev;
      });
    },
    [setAllChats]
  );

  const handleToggleSidebar = () => {
    setIsEmpanded((prev) => !prev);
  };
  return (
    <div
      className={
        isEmpanded
          ? "chat-side-menu-container chat-side-menu-container"
          : "chat-side-menu-container-collapsed chat-side-menu-container"
      }
    >
      <div className="add-new-chat-button-cont">
        <div className="chat-sm-toggle">
          {isEmpanded ? (
            <IconButton
              onClick={handleToggleSidebar}
              size="small"
              sx={{
                ":hover": {
                  background: "white",
                },
                border: "1px solid white",
                padding: "0px",
                background: "white",
              }}
            >
              <ArrowLeftIcon sx={{ color: "black" }} />
            </IconButton>
          ) : (
            <IconButton
              onClick={handleToggleSidebar}
              size="small"
              sx={{
                ":hover": {
                  background: "white",
                },
                border: "1px solid white",
                padding: "0px",
                background: "white",
              }}
            >
              <ArrowRightIcon sx={{ color: "black" }} />
            </IconButton>
          )}
        </div>
        <Button
          size="small"
          variant="outline"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{
            minHeight: "50px",
            alignSelf: "center",
            textWrap: "nowrap",
            // padding: isEmpanded ? "2px" : "0px",
          }}
          className={
            "add-new-chat-button" + (isDarkTheme ? " add-chat-dark" : "")
          }
        >
          <PersonAddAltIcon color="success" />
          {isEmpanded && (
            <motion.h4 initial={{ scale: 0 }} animate={{ scale: 1 }}>
              New Chat
            </motion.h4>
          )}
        </Button>
      </div>
      <MenuList
        id="basic-menu"
        open={open}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {allChats.map(({ _id, to, from, newMsgCount = 0 }) => {
          const userToshow = to._id === user._id ? from : to;
          return (
            <MenuItem
              key={_id}
              className="border-bottom-chat-menu"
              onClick={() => {
                setActiveUser(_id);
                clearNewMessageCountOnClick(_id);
                navigate(`/chats/${_id}`);
              }}
              sx={{
                background:
                  activeUser === _id
                    ? isDarkTheme
                      ? "#313131"
                      : "#c1c1c1"
                    : "transparent",
              }}
            >
              <div className="per-chat-line">
                <div>
                  <Badge badgeContent={newMsgCount} color="primary">
                    <Avatar
                      src={userToshow.picture}
                      sx={{ height: "35px", width: "35px" }}
                    />
                  </Badge>
                  {isEmpanded && (
                    <motion.h5 initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {userToshow.username ||
                        `${userToshow.email.slice(0, 15)}...`}
                    </motion.h5>
                  )}
                </div>
              </div>
            </MenuItem>
          );
        })}
      </MenuList>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        PaperProps={popperProps}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <AddNewChat user={user} handleClose={handleClose} />
      </Menu>
    </div>
  );
};

const AddNewChat = memo(({ user, handleClose }) => {
  const [value, setValue] = useState({});
  const [defaultOptions, setdefaultOptions] = useState([]);

  const debouncedLoadOptions = debounce(async (inputValue, callback) => {
    try {
      const { response = [] } = await searchEmail(inputValue);
      const options = response.filter((u) => u._id !== user._id);

      callback(options);
    } catch (error) {
      console.error("Error fetching options:", error);
      callback([]);
    }
  }, 500);

  const loadOptions = (inputValue, callback) => {
    debouncedLoadOptions(inputValue, callback);
  };

  const handleChange = useCallback((val) => setValue(val), []);

  useEffect(() => {
    async function fetchOptions() {
      debouncedLoadOptions("", (opts) => {
        setdefaultOptions(opts);
      });
    }
    fetchOptions();
  }, []);

  const handleStartMessage = () => {
    const payload = { ...value };
    emitter.emit("ADD_NEW_CHAT", payload);
  };

  return (
    <div className="start-new-chat-container ffffffffffff">
      <div className="new-chat-header">
        <h3>Start New Chat</h3>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </div>
      <div className="he-20"></div>
      <AsyncSelect
        defaultOptions={defaultOptions}
        // components={{
        //   Option: CustomOption,
        // }}
        getOptionLabel={(o) => {
          return <CustomOption data={o} />;
        }}
        // labelKey="username"
        value={value}
        loadOptions={loadOptions}
        onChange={handleChange}
        isClearable
        placeholder="Search..."
      />
      {value._id && (
        <div
          style={{ display: "flex", justifyContent: "end", paddingTop: "20px" }}
        >
          <Button
            onClick={handleStartMessage}
            sx={{ alignSelf: "end" }}
            variant="outlined"
          >
            Start Messaging
          </Button>
        </div>
      )}
    </div>
  );
});
const CustomOption = ({ data }) => {
  return (
    <div className="custom-async-dropdown-option">
      <Avatar src={data.picture} />
      <div className="fsfkfijge">
        <h4>{data.username || data.email}</h4>
        <h6 style={{ opacity: "40%" }}>{data.email}</h6>
      </div>
    </div>
  );
};

AddNewChat.displayName = "AddNewChat";

export default ChatSideMenu;
