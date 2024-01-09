/* eslint-disable react/prop-types */
import { memo, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { debounce } from "lodash";

import Button from "@mui/material/Button";
import {
  Avatar,
  Badge,
  IconButton,
  MenuItem,
  MenuList,
  TextField,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { Close } from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import useAuth from "@/utils/useAuth";
import { emitter, listenToEvent } from "@/utils/eventemitter";

import { searchEmail } from "@/controllers/emailController";
import { ThemeTypeContext } from "@/App";

import "./groupSideMenuStyles.css";
import useWindowDimens from "@/utils/useWindowDimens";
import LoggedInUserProfile from "@/components/userProfile";
import AsyncSelect from "@/components/coreComponents/AsyncSelect";

const popperProps = {
  elevation: 1,
  sx: {
    overflow: "visible",
    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
    mt: 1.5,
  },
};

const GroupSideMenu = ({ allGroups, setAllGroups }) => {
  console.log(
    `%c allGroups `,
    "color: green;border:1px solid green",
    allGroups
  );
  const innerWidth = useWindowDimens();

  const [isEmpanded, setIsEmpanded] = useState(true);
  const { ...params } = useParams();
  const message_id = params?.["*"];

  const { user } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const [activeUser, setActiveUser] = useState(message_id || null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [typingEffect, setTypingEffect] = useState(false);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveUser(message_id);
  }, [message_id]);

  const handleOpen = (event) => {
    // setOpen(true);
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
    listenToEvent(`SIDE_MENU_TYPING_EFFECT`, ({ chattingTo, chat_id }) => {
      console.log(
        `%c chat_id `,
        "color: green;border:1px solid green",
        chat_id
      );
      setTypingEffect(chat_id);
      let id = setTimeout(() => {
        clearTimeout(id);
        setTypingEffect(null);
      }, 2000);
    });
    return () => {
      emitter.off("CLOSE_ADD_NEW_CHAT_POPUP", closeLayer);
    };
  }, []);

  useEffect(() => {
    return () => {};
  }, []);

  const clearNewMessageCountOnClick = useCallback(
    (_id) => {
      let haveNewMessage = false;
      setAllGroups((prev) => {
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
    [setAllGroups]
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
      <div className="add-new-chat-button-cont border-bottom-chat-menu">
        {innerWidth > 750 && (
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
        )}
        <h3>{innerWidth > 750 ? null : "Workspace"}</h3>
        <div style={{ gap: "10px", display: "flex" }}>
          <IconButton
            disableFocusRipple
            disableRipple
            size="small"
            variant="outline"
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleOpen}
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
            {isEmpanded && innerWidth > 750 && (
              <motion.h4
                style={{ color: isDarkTheme ? "white" : "black" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                New Group
              </motion.h4>
            )}
          </IconButton>

          {innerWidth < 750 && <LoggedInUserProfile />}
        </div>
      </div>
      <MenuList
        id="basic-menu"
        open={open}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {allGroups.map(
          ({ _id, messages, members, description, title, picture }) => {
            const lastMessage = messages.at(-1) || {};

            const time = new Date(lastMessage?.timestamp);

            const displayTime = lastMessage._id
              ? `${
                  time.getHours() > 12 ? time.getHours() - 12 : time.getHours()
                }:${time.getMinutes()} ${time.getHours() > 12 ? "PM" : "AM"}`
              : "";
            return (
              <MenuItem
                key={_id}
                onClick={() => {
                  setActiveUser(_id);
                  clearNewMessageCountOnClick(_id);
                  navigate(`/groups/${_id}`);
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
                <motion.div
                  className="per-chat-line"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Badge badgeContent={0} color="primary">
                    <Avatar
                      src={picture}
                      sx={{ height: "35px", width: "35px" }}
                    />
                  </Badge>
                  {isEmpanded && (
                    <motion.div
                      style={{ width: "100%" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <h5>
                        {title.length < 15
                          ? title
                          : `${title?.slice(0, 15)}...`}
                      </h5>
                      <div className="time-and-lastmsg">
                        <h6
                          style={{
                            color: isDarkTheme ? "white" : "black",
                            opacity: "50%",
                          }}
                        >
                          {typingEffect === _id ? (
                            <h4 className="green-typing">Typing...</h4>
                          ) : (
                            lastMessage.msg
                          )}
                        </h6>
                        <h6
                          style={{
                            color: isDarkTheme ? "white" : "black",
                            opacity: "50%",
                          }}
                        >
                          {displayTime}
                        </h6>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </MenuItem>
            );
          }
        )}
      </MenuList>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        PaperProps={popperProps}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {/* <Dialog open={isOpen} onClose={() => setOpen(false)}> */}
        <AddNewChat user={user} handleClose={handleClose} />
        {/* </Dialog> */}
      </Menu>
    </div>
  );
};

const AddNewChat = memo(({ user, handleClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    members: [],
  });

  const handleStartMessage = useCallback(() => {
    const payload = {
      messages: [],
      ...formData,
      members: formData.members.concat(user),
      picture: "",
    };
    emitter.emit("ADD_NEW_GROUP", payload);
    handleClose();
  }, [formData, handleClose, user]);

  const handleChangeFormData = useCallback((e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  }, []);

  console.log("formData", formData);

  const handleOnChange = useCallback((data) => {
    setFormData((p) => ({ ...p, members: data }));
  }, []);

  const fetchOptions = useCallback(async (searchValue) => {
    const { response = [] } = await searchEmail(searchValue);
    return response;
  }, []);

  return (
    <div className="start-new-chat-container">
      <div className="new-chat-header">
        <h3>Create a group</h3>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
      </div>
      <div className="he-20"></div>
      <div className="create-edit-group-box">
        <TextField
          placeholder="Group name"
          onChange={handleChangeFormData}
          value={formData.title}
          name="title"
        />
        <TextField
          placeholder="Group Description (optional)"
          onChange={handleChangeFormData}
          value={formData.description}
          name="description"
        />
        <h4>Group Members</h4>
        <AsyncSelect
          fetchOptions={fetchOptions}
          handleOnChange={handleOnChange}
          label={"Add member"}
          CustomOption={CustomOption}
        />
      </div>

      <div
        style={{ display: "flex", justifyContent: "end", paddingTop: "20px" }}
      >
        <Button
          onClick={handleStartMessage}
          sx={{ alignSelf: "end" }}
          variant="outlined"
        >
          Save Group
        </Button>
      </div>
    </div>
  );
});
const CustomOption = ({ data }) => {
  return (
    <div className="custom-async-dropdown-option-group">
      <Avatar src={data.picture} />
      <div className="fsfkfijge">
        <h4>{data.username || data.email}</h4>
        <h6 style={{ opacity: "40%" }}>{data.email}</h6>
      </div>
    </div>
  );
};
AddNewChat.displayName = "AddNewChat";

export default GroupSideMenu;
