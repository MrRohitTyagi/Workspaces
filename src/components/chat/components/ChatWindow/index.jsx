/* eslint-disable react/prop-types */
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./chatWindow.css";
import { useParams } from "react-router-dom";

import SendIcon from "@mui/icons-material/Send";
import {
  Avatar,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";

import { v4 } from "uuid";
import useAuth from "@/utils/useAuth";
import { ThemeTypeContext } from "@/App";
import {
  deleteSingleMessage,
  getUserChat,
  saveMessages,
} from "@/controllers/chatController";
import { emitter, listenToEvent } from "@/utils/eventemitter";

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

const ChatWindow = () => {
  const firstLoadRef = useRef(true);
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [perChat, setPerChat] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const [deletedMsgs, setdeletedMsgs] = useState([]);

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
    (async function fetchChat() {
      const { response: perChat } = await getUserChat(chat_id);
      setPerChat(perChat);
      setMessages(perChat?.messages || []);

      setIsLoading(false);
    })();
  }, [chat_id]);

  const handleMessages = useCallback(() => {
    if (!value) return;
    const newMessage = {
      from: currentUser._id,
      msg: value,
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
    setValue("");
  }, [currentUser._id, chat_id, perChat?.from, perChat?.to, value]);

  useEffect(() => {
    listenToEvent(`NEW_MESSAGE_RECEIVED_${chat_id}`, (data) => {
      setMessages((prev) => [...prev, data.message]);
    });
    listenToEvent(`DELETE_SINGLE_MESSAGE_${chat_id}`, (data) => {
      const { message_id } = data || {};
      setMessages((prev) => prev.filter((m) => m._id !== message_id));
    });
    return () => {
      emitter.off(`NEW_MESSAGE_RECEIVED_${chat_id}`, () => {});
      emitter.off(`DELETE_SINGLE_MESSAGE_${chat_id}`, () => {});
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
                <Avatar src={chattingWith?.picture} />
              </HtmlTooltip>
              <h3>{chattingWith?.username || chattingWith?.email}</h3>
            </div>
            {}
          </div>
          <div ref={ref} className="messages-box">
            {messages.map((message) => {
              const { from, _id } = message || {};
              const isMyMsg = from === currentUser._id;
              return (
                <MessageTextBox
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
              className="send-message-input"
              placeholder="Type Here ..."
              onKeyDown={(e) => {
                if (e.keyCode === 13) handleMessages();
              }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
                  <IconButton onClick={handleMessages}>
                    <SendIcon />
                  </IconButton>
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
};
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import Zoom from "@mui/material/Zoom";
import Loader from "@/components/Loader";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";

const MessageTextBox = ({
  isMyMsg,
  isDarkTheme,
  message,
  deleteMessage,
  handleDoubleClickSelectMessage,
}) => {
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
        {isMyMsg && !message.isSelected ? (
          <HtmlTooltip
            TransitionComponent={Zoom}
            sx={{ cusror: "pointer" }}
            placement={isMyMsg ? "left" : "right"}
            title={
              <IconButton
                size="small"
                onClick={() => deleteMessage(message._id)}
              >
                <DeleteForeverIcon color="warning" />
              </IconButton>
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
              <div
                className="message-timestamp"
                style={{ ...(isMyMsg ? { right: "4%" } : { left: "3%" }) }}
              >
                {displayTime}
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
            <div
              className="message-timestamp"
              style={{ ...(isMyMsg ? { right: "4%" } : { left: "3%" }) }}
            >
              {displayTime}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatWindow;
