/* eslint-disable react/prop-types */
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import Button from "@mui/material/Button";
import {
  Avatar,
  Badge,
  IconButton,
  InputAdornment,
  MenuItem,
  MenuList,
  TextField,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
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
import InputFileUpload from "@/components/coreComponents/InputFileUpload";
import { toast } from "react-toastify";

const popperProps = {
  elevation: 1,
  sx: {
    overflow: "visible",
    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
    mt: 1.5,
  },
};
let timerId;
const GroupSideMenu = memo(({ allGroups, setAllGroups }) => {
  console.log(
    `%c allGroups `,
    "color: green;border:1px solid green",
    allGroups
  );
  const innerWidth = useWindowDimens();

  const [isEmpanded, setIsEmpanded] = useState(true);
  const { ...params } = useParams();
  const group_id = params?.["*"];

  const { user } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const [activeUser, setActiveUser] = useState(group_id || null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [typingEffect, setTypingEffect] = useState(false);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  useEffect(() => {
    setActiveUser(group_id);
  }, [group_id]);

  const handleOpen = useCallback((event) => {
    // setOpen(true);
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  useEffect(() => {
    function closeLayer() {
      setAnchorEl(null);
    }
    // listenToEvent("CLOSE_ADD_NEW_CHAT_POPUP", closeLayer);
    listenToEvent(
      `GROUP_SIDE_MENU_TYPING_EFFECT`,
      ({ typing_by, group_id }) => {
        clearTimeout(timerId);
        setTypingEffect({ typing_by, group_id });
        timerId = setTimeout(() => {
          setTypingEffect(null);
          clearTimeout(timerId);
        }, 2000);
      }
    );
    return () => {
      emitter.off("CLOSE_ADD_NEW_CHAT_POPUP", closeLayer);
      emitter.off("GROUP_SIDE_MENU_TYPING_EFFECT");
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

  const handleToggleSidebar = useCallback(() => {
    setIsEmpanded((prev) => !prev);
  }, []);

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
            <GroupsIcon color="success" />
            {isEmpanded && innerWidth > 750 && (
              <motion.h5
                style={{ color: isDarkTheme ? "white" : "black" }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                New Group
              </motion.h5>
            )}
          </IconButton>

          {innerWidth < 750 && <LoggedInUserProfile />}
        </div>
      </div>

      {allGroups.length > 0 ? (
        <MenuList
          id="basic-menu"
          open={open}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {allGroups.map(({ _id, messages, title, picture }) => {
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
                          {typingEffect &&
                          typingEffect.group_id !== group_id &&
                          typingEffect.group_id === _id &&
                          typingEffect.typing_by !==
                            (user.username || user.email) ? (
                            <h4
                              className={
                                isDarkTheme
                                  ? "green-typing-dark"
                                  : "green-typing"
                              }
                            >
                              {typingEffect?.typing_by || ""}...
                            </h4>
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
          })}
        </MenuList>
      ) : (
        <div className="no-chat-cont">No groups found</div>
      )}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        PaperProps={popperProps}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        {/* <Dialog open={isOpen} onClose={() => setOpen(false)}> */}
        <AddNewGroup user={user} handleClose={handleClose} />
        {/* </Dialog> */}
      </Menu>
    </div>
  );
});

const AddNewGroup = memo(({ user, handleClose }) => {
  const [picture, setPicture] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    members: [],
  });

  const handleStartGroup = useCallback(() => {
    const payload = {
      messages: [],
      createdBy: user._id,
      admins: [user._id],
      ...formData,
      members: formData.members.concat(user),
      picture,
    };
    if (!payload.title) {
      toast.error("Group Name is required");
      return;
    }
    emitter.emit("ADD_NEW_GROUP", payload);
    handleClose();
  }, [formData, handleClose, picture, user]);

  const handleChangeFormData = useCallback((e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  }, []);

  const handleOnChange = useCallback((data) => {
    setFormData((p) => ({ ...p, members: data }));
  }, []);

  const fetchOptions = useCallback(async (searchValue) => {
    const { response = [] } = await searchEmail(searchValue);
    return response;
  }, []);

  const filter = useMemo(() => {
    return { key: "_id", value: user._id };
  }, [user._id]);
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
          InputProps={{
            endAdornment: (
              <InputAdornment>
                <InputFileUpload picture={picture} setPicture={setPicture} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          placeholder="Group Description (optional)"
          onChange={handleChangeFormData}
          value={formData.description}
          name="description"
        />
        <h4>Group Members</h4>
        <AsyncSelect
          filterConfig={filter}
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
          onClick={handleStartGroup}
          sx={{ alignSelf: "end" }}
          variant="outlined"
        >
          Save Group
        </Button>
      </div>
    </div>
  );
});
const CustomOption = memo(({ data }) => {
  return (
    <div className="custom-async-dropdown-option-group">
      <Avatar src={data.picture} />
      <div className="fsfkfijge">
        <h4>{data.username || data.email}</h4>
        <h6 style={{ opacity: "40%" }}>{data.email}</h6>
      </div>
    </div>
  );
});
CustomOption.displayName = "CustomOption";
GroupSideMenu.displayName = "GroupSideMenu";
AddNewGroup.displayName = "AddNewGroup";

export default GroupSideMenu;
