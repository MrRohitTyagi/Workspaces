/* eslint-disable react/prop-types */
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { startCase } from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import Zoom from "@mui/material/Zoom";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import useAuth from "@/utils/useAuth";
import { ThemeTypeContext } from "@/App";

import { emitter, listenToEvent } from "@/utils/eventemitter";
import Loader from "@/components/Loader";
import {
  deleteOneGroupMessage,
  getOneGroup,
  saveGroupMessage,
  sendImageMessageGroup,
} from "@/controllers/groupController";
import { socket } from "@/components/authorizeUser";
import "./groupWindow.css";
import MessageImageUpload from "@/components/chat/components/ChatWindow/MessageImageUpload";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));
let timerID;
const GroupWindow = memo(() => {
  const firstLoadRef = useRef(true);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInputValue, setMessageInputValue] = useState("");
  // const [chatImage, setChatImage] = useState(null);

  const [perGroup, setPerGroup] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const [deletedMsgs, setdeletedMsgs] = useState([]);
  const [typingEffect, setTypingEffect] = useState(false);
  const { id: group_id } = useParams();
  const groupMembersRef = useRef({});
  const ref = useRef();
  const inputRef = useRef();

  // useEffect(() => {
  //   socket.emit("JOIN_ROOM", group_id);
  //   return () => {
  //     socket.emit("LEAVE_ROOM", group_id);
  //   };
  // }, [group_id]);

  useEffect(() => {
    emitter.emit("HIDE_APP_BAR");

    return () => {
      emitter.emit("HIDE_APP_BAR");
    };
  }, []);

  useEffect(() => {
    (async function fetchChat() {
      const { response: perGroup } = await getOneGroup(group_id);
      const obj = {};
      for (const member of perGroup.members) {
        obj[member._id] = member;
      }
      groupMembersRef.current = obj;
      setMessages(perGroup?.messages || []);
      setPerGroup(perGroup);
      setIsLoading(false);
    })();
  }, [group_id]);

  const handleMessages = useCallback(() => {
    if (!messageInputValue) return;
    const newMessage = {
      from: currentUser._id,
      msg: messageInputValue,
      _id: v4(),
    };

    setMessages((p) => [...p, newMessage]);

    saveGroupMessage({
      group_id: group_id,
      message: newMessage,
      // to: userToshow._id,
    });
    setMessageInputValue("");
  }, [messageInputValue, currentUser._id, group_id]);

  useEffect(() => {
    listenToEvent(`NEW_GROUP_MESSAGE_${group_id}`, (message) => {
      if (message.from === currentUser._id) return;
      setMessages((prev) => [...prev, message]);
    });
    listenToEvent(`GROUP_MESSAGE_DELETED_${group_id}`, (data) => {
      const { from, message_id } = data || {};
      if (from === currentUser._id) return;
      setMessages((prev) => prev.filter((m) => m._id !== message_id));
    });

    listenToEvent(`SHOW_GROUP_TYPING_EFFECT_${group_id}`, (data) => {
      const { typing_by } = data;
      setTypingEffect(typing_by);
      clearTimeout(timerID);
      timerID = setTimeout(() => {
        setTypingEffect(null);
        clearTimeout(timerID);
      }, 2000);
    });

    return () => {
      emitter.off(`NEW_GROUP_MESSAGE_${group_id}`, () => {});
      emitter.off(`GROUP_MESSAGE_DELETED_${group_id}`, () => {});
      emitter.off(`SHOW_GROUP_TYPING_EFFECT_${group_id}`, () => {});
    };
  }, [currentUser._id, group_id]);

  useEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        ref.current.scroll({
          top: ref.current.scrollHeight,
          behavior: firstLoadRef.current ? "instant" : "smooth",
        });
        firstLoadRef.current = false;
      }, 100);
    }
  }, [messages]);

  const handleDoubleClickSelectMessage = useCallback(({ _id }) => {
    setMessages((prev) => {
      const array = [];
      for (let msg of prev) {
        if (msg._id === _id) {
          if (msg.isSelected) {
            delete msg.isSelected;
            setdeletedMsgs((prev) => prev.filter((m) => m !== _id));
          } else {
            setdeletedMsgs((prev) => [...prev, _id]);
            msg.isSelected = true;
          }
          array.push(msg);
        } else array.push(msg);
      }
      return array;
    });
  }, []);

  const deleteAllSelected = useCallback(async () => {
    for (const message_id of deletedMsgs) {
      await deleteOneGroupMessage({
        group_id: group_id,
        message_id: message_id,
      });
    }
    setMessages((prev) => prev.filter((m) => !deletedMsgs.includes(m._id)));
    setdeletedMsgs([]);

    toast.success("Messages Deleted");
  }, [group_id, deletedMsgs]);

  const handleOnchange = useCallback(
    (e) => {
      setMessageInputValue(e.target.value);
      socket.emit("GROUP_USER_TYPING", {
        typing_by: currentUser.username || currentUser.email,
        group_id,
      });
    },
    [currentUser, group_id]
  );

  const handleImageUpload = useCallback(
    (file) => {
      if (!file) return;
      // setChatImage(file);
      const newMessage = {
        from: currentUser._id,
        msg: messageInputValue,
        image: file,
        _id: v4(),
      };
      setMessages((p) => [...p, newMessage]);
      sendImageMessageGroup(
        {
          group_id: group_id,
          message: newMessage,
        },
        file
      );
      if (messageInputValue) setMessageInputValue("");
      // setChatImage(null);
    },
    [currentUser._id, group_id, messageInputValue]
  );

  const deleteMessage = useCallback(
    (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
      deleteOneGroupMessage({
        group_id: group_id,
        message_id: id,
      });
    },
    [group_id]
  );

  return (
    <div className={`chat-window-cont`}>
      <AnimatePresence>
        {deletedMsgs.length > 0 && (
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: "15%" }}
            exit={{ top: "-10%" }}
            className="delete-all-messages"
          >
            <h4
              className={isDarkTheme ? "dark" : ""}
              style={{ color: isDarkTheme ? "white" : "black" }}
            >
              Delete Selected
            </h4>
            <IconButton size="small" onClick={deleteAllSelected}>
              <DeleteForeverIcon color="warning" />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className="messaging-to-cont">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginLeft: "20px",
              }}
            >
              <IconButton
                size="small"
                onClick={() => navigate("/groups/select")}
              >
                <ArrowBackIcon
                  className={isDarkTheme ? "l-t-svg" : "d-t-svg"}
                />
              </IconButton>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => navigate(`/groups/edit/${group_id}`)}
              >
                <Avatar src={perGroup?.picture} />
              </motion.div>

              <div>
                <h3>{perGroup?.title}</h3>

                {typingEffect &&
                typingEffect !== (currentUser.username || currentUser.email) ? (
                  <motion.h4
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    aniini
                    className="typing-effect-text"
                  >
                    {startCase(typingEffect)} is typing...
                  </motion.h4>
                ) : (
                  <h3 style={{ height: "16px" }} />
                )}
              </div>
            </div>
            {}
          </div>
          <div ref={ref} className="messages-box">
            {messages.map((message) => {
              const { from, _id } = message || {};
              const isMyMsg = from === currentUser._id;
              return (
                <MessageDisplayBox
                  groupMembersRef={groupMembersRef}
                  handleDoubleClickSelectMessage={
                    handleDoubleClickSelectMessage
                  }
                  deleteMessage={deleteMessage}
                  key={_id}
                  isMyMsg={isMyMsg}
                  isDarkTheme={isDarkTheme}
                  message={message}
                />
              );
            })}
          </div>
          <div className="send-bar-bottom">
            <OutlinedInput
              ref={inputRef}
              className="send-message-input"
              placeholder="Type Here ..."
              onKeyDown={(e) => {
                if (e.keyCode === 13) handleMessages();
              }}
              value={messageInputValue}
              onChange={handleOnchange}
              sx={{
                width: "80%",
                height: "80%",
                borderRadius: "10px",
                ...(isDarkTheme
                  ? { color: "white", background: "#555555" }
                  : {}),
              }}
              endAdornment={
                <InputAdornment position="end">
                  <div style={{ display: "flex", gap: "10px" }}>
                    <MessageImageUpload callback={handleImageUpload} />
                    <IconButton onClick={handleMessages}>
                      <SendIcon />
                    </IconButton>
                  </div>
                </InputAdornment>
              }
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                "aria-label": "weight",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
});
const MessageDisplayBox = ({
  isMyMsg,
  isDarkTheme,
  message,
  deleteMessage,
  handleDoubleClickSelectMessage,
  groupMembersRef,
}) => {
  const time = new Date(message?.timestamp || new Date().getTime());
  const displayTime = `${time.getHours()}:${time.getMinutes()} ${
    time.getHours() > 12 ? "PM" : "AM"
  }`;
  const message_bottom_text = isMyMsg
    ? displayTime
    : `${displayTime} - @${
        groupMembersRef?.current?.[message?.from]?.username ||
        groupMembersRef?.current?.[message?.from]?.email ||
        ""
      }`;
  const handleSelect = useCallback(() => {
    handleDoubleClickSelectMessage(message);
  }, [handleDoubleClickSelectMessage, message]);

  return (
    <motion.div
      className="msg-box"
      style={{
        borderRadius: isMyMsg ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
        ...(message.isSelected ? { background: "rgba(79, 79, 147, 0.5)" } : {}),
        justifyContent: isMyMsg ? "flex-end" : "flex-start",
      }}
    >
      <AnimatePresence>
        {isMyMsg && !message.isSelected ? (
          <HtmlTooltip
            TransitionComponent={Zoom}
            sx={{ cusror: "pointer" }}
            placement={isMyMsg ? "left" : "right"}
            title={
              <div>
                <IconButton
                  size="small"
                  onClick={() => deleteMessage(message._id)}
                >
                  <DeleteForeverIcon fontSize="small" color="warning" />
                </IconButton>
              </div>
            }
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onDoubleClick={handleSelect}
              className={`single-message-box ${
                isDarkTheme ? "single-message-box-dark" : ""
              }`}
              style={{
                ...(message.isSelected ? { background: "#4f4f93" } : {}),
                borderRadius: isMyMsg
                  ? "10px 10px 2px 10px"
                  : "10px 10px 10px 2px",
                textAlign: isMyMsg ? "right" : "left",
              }}
            >
              {message.msg}
              {message.image ? (
                <img
                  className="chat-Image-tag"
                  src={
                    typeof message.image === "string"
                      ? message.image
                      : URL.createObjectURL(message.image)
                  }
                />
              ) : null}
              <div
                className="message-timestamp"
                style={{ ...(isMyMsg ? { right: "4%" } : { left: "3%" }) }}
              >
                {message.edited ? "Edited  " : null} {message_bottom_text}
              </div>
            </motion.div>
          </HtmlTooltip>
        ) : (
          <motion.div
            onDoubleClick={isMyMsg ? handleSelect : () => {}}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`single-message-box ${
              isDarkTheme ? "single-message-box-dark" : ""
            }`}
            style={{
              borderRadius: isMyMsg
                ? "10px 10px 2px 10px"
                : "10px 10px 10px 2px",
              textAlign: isMyMsg ? "right" : "left",
            }}
          >
            {message.msg}
            {message.image ? (
              <img
                className="chat-Image-tag"
                src={
                  typeof message.image === "string"
                    ? message.image
                    : URL.createObjectURL(message.image)
                }
              />
            ) : null}
            <div
              className="message-timestamp"
              style={{ ...(isMyMsg ? { right: "4%" } : { left: "3%" }) }}
            >
              {message_bottom_text} {message.edited ? "  Edited" : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

GroupWindow.displayName = "GroupWindow";
MessageDisplayBox.displayName = "MessageDisplayBox";

export default GroupWindow;
