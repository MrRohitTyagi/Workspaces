/* eslint-disable react/prop-types */
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./chatWindow.css";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { v4 } from "uuid";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  IconButton,
  Input,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";

import useAuth from "@/utils/useAuth";
import { ThemeTypeContext } from "@/App";
import {
  deleteSingleMessage,
  getUserChat,
  saveEditedMessageController,
  saveMessages,
  sendImageMessageChat,
} from "@/controllers/chatController";
import { emitter, listenToEvent } from "@/utils/eventemitter";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import Zoom from "@mui/material/Zoom";
import Loader from "@/components/Loader";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import FileDownloadDoneIcon from "@mui/icons-material/FileDownloadDone";
import { socket } from "@/components/authorizeUser";
import MessageImageUpload from "./MessageImageUpload";

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
let timerId;
const ChatWindow = memo(() => {
  const firstLoadRef = useRef(true);
  const [messages, setMessages] = useState([]);
  const [messageInputValue, setMessageInputValue] = useState("");
  // const [chatImage, setChatImage] = useState(null);
  const [perChat, setPerChat] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const [deletedMsgs, setdeletedMsgs] = useState([]);
  const [typingEffect, setTypingEffect] = useState(false);

  const { id: chat_id } = useParams();

  const ref = useRef();

  const chattingWith = useMemo(() => {
    return (
      (perChat?.to?._id === currentUser._id ? perChat?.from : perChat?.to) || {}
    );
  }, [currentUser._id, perChat?.from, perChat?.to]);

  const deleteMessage = useCallback(
    (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
      deleteSingleMessage({
        chat_id: chat_id,
        message_id: id,
        to: chattingWith._id,
      });
    },
    [chat_id, chattingWith._id]
  );

  useEffect(() => {
    emitter.emit("HIDE_APP_BAR");
    return () => {
      emitter.emit("HIDE_APP_BAR");
    };
  }, []);

  useEffect(() => {
    (async function fetchChat() {
      const { response: perChat } = await getUserChat(chat_id);
      setPerChat(perChat);
      setMessages(perChat?.messages || []);

      setIsLoading(false);
    })();
  }, [chat_id]);

  const handleMessages = useCallback(() => {
    if (!messageInputValue) return;
    const newMessage = {
      from: currentUser._id,
      msg: messageInputValue,
      _id: v4(),
    };

    const userToshow =
      perChat?.to?._id === currentUser._id ? perChat?.from : perChat?.to;

    setMessages((p) => [...p, newMessage]);
    saveMessages({
      message_id: chat_id,
      message: newMessage,
      to: userToshow._id,
    });
    setMessageInputValue("");
  }, [messageInputValue, currentUser._id, perChat?.to, perChat?.from, chat_id]);

  useEffect(() => {
    listenToEvent(`NEW_MESSAGE_RECEIVED_${chat_id}`, (data) => {
      setMessages((prev) => [...prev, data.message]);
    });
    listenToEvent(`DELETE_SINGLE_MESSAGE_${chat_id}`, (data) => {
      const { message_id } = data || {};
      setMessages((prev) => prev.filter((m) => m._id !== message_id));
    });
    listenToEvent(`SHOW_TYPING_EFFECT_${chat_id}`, () => {
      setTypingEffect(true);
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        setTypingEffect(false);
        clearTimeout(timerId);
      }, 2000);
    });
    listenToEvent(`EDITED_SINGLE_MESSAGE_${chat_id}`, (data) => {
      const { message_id, msg } = data || {};
      setMessages((prev) =>
        prev.map((m) =>
          m._id === message_id ? { ...m, msg, edited: true } : m
        )
      );
    });
    return () => {
      emitter.off(`SIDE_MENU_TYPING_EFFECT`, () => {});
      emitter.off(`NEW_MESSAGE_RECEIVED_${chat_id}`, () => {});
      emitter.off(`DELETE_SINGLE_MESSAGE_${chat_id}`, () => {});
      emitter.off(`EDITED_SINGLE_MESSAGE_${chat_id}`, () => {});
      emitter.off(`SHOW_TYPING_EFFECT_${chat_id}`, () => {});
    };
  }, [chat_id]);

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
      await deleteSingleMessage({ chat_id, message_id, to: chattingWith._id });
    }
    setMessages((prev) => prev.filter((m) => !deletedMsgs.includes(m._id)));
    setdeletedMsgs([]);

    toast.success("Messages Deleted");
  }, [chat_id, chattingWith._id, deletedMsgs]);

  const deleteEditMessage = useCallback((message_id) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m._id === message_id) {
          return { ...m, isEditing: true };
        } else return m;
      })
    );
  }, []);

  const saveEditedMessage = useCallback(
    (message_id, val) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id === message_id) {
            const payload = {
              chat_id,
              message_id,
              to: chattingWith._id,
              msg: val,
            };
            saveEditedMessageController(payload);
            return { ...m, isEditing: false, msg: val, edited: true };
          } else return m;
        })
      );
    },
    [chat_id, chattingWith._id]
  );

  const handleOnchange = useCallback(
    (e) => {
      setMessageInputValue(e.target.value);
      socket.emit("USER_TYPING", {
        chattingTo: chattingWith._id,
        chat_id,
      });
    },
    [chat_id, chattingWith._id]
  );

  const handleImageUpload = useCallback(
    (file) => {
      if (!file) return;
      const newMessage = {
        from: currentUser._id,
        msg: messageInputValue,
        image: file,
        _id: v4(),
      };

      const userToshow =
        perChat?.to?._id === currentUser._id ? perChat?.from : perChat?.to;

      setMessages((p) => [...p, newMessage]);
      sendImageMessageChat(
        {
          message_id: chat_id,
          message: newMessage,
          to: userToshow._id,
        },
        file
      );
      if (messageInputValue) setMessageInputValue("");
    },
    [chat_id, currentUser._id, messageInputValue, perChat?.from, perChat?.to]
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
              <IconButton size="small" onClick={() => window.history.back()}>
                <ArrowBackIcon
                  className={isDarkTheme ? "l-t-svg" : "d-t-svg"}
                />
              </IconButton>
              <HtmlTooltip
                TransitionComponent={Zoom}
                sx={{ cusror: "pointer" }}
                placement={"bottom"}
                title={
                  <IconButton
                    onClick={() =>
                      emitter.emit("DELETE_CHATFROM_SIDEMENU", {
                        message_id: perChat._id,
                      })
                    }
                  >
                    <DeleteForeverIcon color="warning" />
                  </IconButton>
                }
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Avatar src={chattingWith?.picture} />
                </motion.div>
              </HtmlTooltip>
              <div>
                <h3>{chattingWith?.username || chattingWith?.email}</h3>

                {typingEffect ? (
                  <motion.h4
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    aniini
                    className="typing-effect-text"
                  >
                    Typing...
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
                  handleDoubleClickSelectMessage={
                    handleDoubleClickSelectMessage
                  }
                  deleteMessage={deleteMessage}
                  saveEditedMessage={saveEditedMessage}
                  deleteEditMessage={deleteEditMessage}
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
ChatWindow.displayName = "ChatWindow";

const MessageDisplayBox = ({
  isMyMsg,
  isDarkTheme,
  message,
  deleteMessage,
  deleteEditMessage,
  handleDoubleClickSelectMessage,
  saveEditedMessage,
}) => {
  const [value, setvalue] = useState("");
  useEffect(() => {
    setvalue(message.msg);
  }, [message.msg]);

  const time = new Date(message?.timestamp || new Date().getTime());
  const displayTime = `${time.getHours()}:${time.getMinutes()} ${
    time.getHours() > 12 ? "PM" : "AM"
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
        {message.isEditing ? (
          <div>
            <IconButton
              size="small"
              onClick={() => {
                saveEditedMessage(message._id, value);
              }}
            >
              <FileDownloadDoneIcon fontSize="small" color="success" />
            </IconButton>
            <Input
              sx={{
                input: { textAlign: isMyMsg ? "right" : "left" },
                ":before": { border: "none !important" },
                ":after": { border: "none !important" },
                ...(isDarkTheme ? { color: "white" } : {}),
              }}
              onChange={(e) => setvalue(e.target.value)}
              value={value}
            />
          </div>
        ) : isMyMsg && !message.isSelected ? (
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

                {!message.image && (
                  <IconButton
                    size="small"
                    onClick={() => deleteEditMessage(message._id)}
                  >
                    <BorderColorIcon fontSize="small" color="success" />
                  </IconButton>
                )}
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
                {message.edited ? "Edited  " : null} {displayTime}
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
              {displayTime} {message.edited ? "  Edited" : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

MessageDisplayBox.displayName = "MessageDisplayBox";
export default ChatWindow;
