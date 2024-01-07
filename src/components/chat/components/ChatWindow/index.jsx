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
import { getUserChat, saveMessages } from "@/controllers/chatController";
import { emitter, listenToEvent } from "@/utils/eventemitter";

const ChatWindow = () => {
  const firstLoadRef = useRef(true);
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [perChat, setPerChat] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);

  const { id: message_id } = useParams();

  const ref = useRef();

  function deleteMessage(id) {
    setMessages((prev) => prev.filter((m) => m._id !== id));
  }

  useEffect(() => {
    (async function fetchChat() {
      const { response: perChat } = await getUserChat(message_id);
      setPerChat(perChat);
      setMessages(perChat?.messages || []);

      setIsLoading(false);
    })();
  }, [message_id]);

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
      message_id: message_id,
      message: newMessage,
      to: userToshow._id,
    });
    setValue("");
  }, [currentUser._id, message_id, perChat?.from, perChat?.to, value]);

  const chattingWith = useMemo(() => {
    return perChat?.to?._id === currentUser._id ? perChat?.from : perChat?.to;
  }, [currentUser._id, perChat?.from, perChat?.to]);

  useEffect(() => {
    listenToEvent(`NEW_MESSAGE_RECEIVED_${message_id}`, (data) => {
      setMessages((prev) => [...prev, data.message]);
    });
  }, [message_id]);

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

  return (
    <div className={`chat-window-cont`}>
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
              <Avatar src={chattingWith?.picture} />
              <h3>{chattingWith?.username || chattingWith?.email}</h3>
            </div>
            <IconButton
              onClick={() =>
                emitter.emit("DELETE_CHATFROM_SIDEMENU", {
                  message_id: perChat._id,
                })
              }
            >
              <DeleteForeverIcon color="warning" />
            </IconButton>
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
  const time = new Date(message.timestamp);
  const displayTime = `${time.getHours()}:${time.getMinutes()} ${
    time.getHours() > 12 ? "AM" : "PM"
  }`;

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
            borderRadius: isMyMsg ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
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
        </div>
      </HtmlTooltip>
    </div>
  );
};

export default ChatWindow;
