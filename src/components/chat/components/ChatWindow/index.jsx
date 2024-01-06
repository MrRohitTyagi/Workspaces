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
import { saveMessages } from "@/controllers/chatController";
import { emitter } from "@/utils/eventemitter";

const ChatWindow = ({ allChats }) => {
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [perChat, setPerChat] = useState({});

  const { user: currentUser } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const { id: msgId } = useParams();

  const ref = useRef();

  function deleteMessage(id) {
    setMessages((prev) => prev.filter((m) => m._id !== id));
  }

  useEffect(() => {
    const perChat = allChats.find((c) => c._id === msgId);
    setPerChat(perChat);
    setMessages(perChat?.messages || []);
    if (ref.current) {
      setTimeout(() => {
        ref.current.scroll({
          top: ref.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  }, [allChats, msgId]);

  const handleMessages = useCallback(
    (e) => {
      window.ee = e;

      if (!value) return;

      const newMessage = {
        from: currentUser._id,
        msg: value,
        _id: v4(),
      };
      emitter.emit("UPDATE_MESSAGES_PER_CHAT", {
        message_id: msgId,
        message: newMessage,
      });
      const userToshow =
        perChat?.to?._id === currentUser._id ? perChat?.from : perChat?.to;

      setMessages((p) => [...p, newMessage]);
      saveMessages({ msgId: msgId, message: newMessage, to: userToshow._id });
      setValue("");
    },
    [currentUser._id, msgId, perChat?.from, perChat?.to, value]
  );

  const chattingWith = useMemo(() => {
    return perChat?.to?._id === currentUser._id ? perChat?.from : perChat?.to;
  }, [currentUser._id, perChat?.from, perChat?.to]);

  console.log(
    `%c {perChat,messages,value,currentUser} `,
    "color: orange;border:2px dotted oranfe",
    { perChat, messages, value, currentUser, allChats, chattingWith }
  );
  return (
    <div className={`chat-window-cont`}>
      <div className="messaging-to-cont">
        <Avatar src={chattingWith?.picture} />
        <h3>{chattingWith?.username || chattingWith?.email}</h3>
      </div>
      <div ref={ref} className="messages-box">
        {messages.map((message) => {
          const { from, _id } = message || {};
          const isMyMsg = from === currentUser._id;
          return (
            <MessageTextBox
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
          placeholder="Type Here ..."
          onKeyDown={(e) => {
            if (e.keyCode === 13) handleMessages();
          }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{
            width: "80%",
            height: "80%",
            borderRadius: "30px",
            ...(isDarkTheme ? { color: "white", background: "#555555" } : {}),
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
    </div>
  );
};
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import Zoom from "@mui/material/Zoom";
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

const MessageTextBox = ({ isMyMsg, isDarkTheme, message, deleteMessage }) => {
  return (
    <div
      className="msg-box"
      style={{
        justifyContent: isMyMsg ? "flex-end" : "flex-start",
      }}
    >
      <HtmlTooltip
        TransitionComponent={Zoom}
        sx={{ cusror: "pointer" }}
        placement={isMyMsg ? "left" : "right"}
        title={
          <IconButton size="small" onClick={() => deleteMessage(message._id)}>
            <DeleteForeverIcon color="warning" />
          </IconButton>
        }
      >
        <div
          className={`single-message-box ${
            isDarkTheme ? "single-message-box-dark" : ""
          }`}
          style={{
            borderRadius: isMyMsg ? "20px 20px 2px 20px" : "20px 20px 20px 2px",
          }}
        >
          {message.msg}
        </div>
      </HtmlTooltip>
    </div>
  );
};

export default ChatWindow;
