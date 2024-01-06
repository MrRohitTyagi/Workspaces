/* eslint-disable react/prop-types */
import { memo, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import AsyncSelect from "react-select/async";

import Button from "@mui/material/Button";
import { Avatar, IconButton, MenuItem, MenuList } from "@mui/material";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { Close } from "@mui/icons-material";
import Menu from "@mui/material/Menu";

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

const ChatSideMenu = ({ allChats }) => {
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

  console.log(
    `%c allChats `,
    "color: orange;border:2px dotted oranfe",
    allChats
  );

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

  return (
    <div className="chat-side-menu-container">
      <div className="add-new-chat-button-cont">
        <Button
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{ alignSelf: "center" }}
          className={
            "add-new-chat-button" + (isDarkTheme ? " add-chat-dark" : "")
          }
        >
          <PersonAddAltIcon color="success" />
          <h3>New Chat</h3>
        </Button>
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
                className="fdsafda"
                onClick={() => {
                  setActiveUser(_id);
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
                    <Avatar
                      src={userToshow.picture}
                      sx={{ height: "35px", width: "35px" }}
                    />
                    <h5>
                      {userToshow.username ||
                        `${userToshow.email.slice(0, 15)}...`}
                    </h5>
                  </div>
                  {newMsgCount > 0 && (
                    <motion.div
                      key={newMsgCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, type: "spring" }}
                      className="new-msg-count"
                    >
                      {newMsgCount}
                    </motion.div>
                  )}
                </div>
              </MenuItem>
            );
          })}
        </MenuList>
      </div>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        // onClose={handleClose}
        // onClick={handleClose}
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
    <div style={{ width: "500px", padding: "20px" }} className="ffffffffffff">
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
