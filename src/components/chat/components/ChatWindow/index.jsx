import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "./chatWindow.css";
import { useParams } from "react-router-dom";

import SendIcon from "@mui/icons-material/Send";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";

import { v4 } from "uuid";
import useAuth from "@/utils/useAuth";
import { ThemeTypeContext } from "@/App";
import { saveMessages } from "@/controllers/chatController";

const ChatWindow = ({ allChats }) => {
  const { user: currentUser } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const { id: msgId } = useParams();
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const ref = useRef();

  useEffect(() => {
    const perChat = allChats.find((c) => c._id === msgId);
    console.log(
      `%c perChat `,
      "color: yellow;border:1px solid lightgreen",
      perChat
    );
    setMessages(perChat?.messages || []);
  }, [allChats, msgId]);

  console.log(
    `%c messages `,
    "color: yellow;border:1px solid lightgreen",
    messages
  );

  const handleMessages = useCallback(
    (e) => {
      window.ee = e;

      if (!value) return;

      const newMessage = {
        from: currentUser._id,
        msg: value,
        _id: v4(),
      };

      setMessages((p) => [...p, newMessage]);
      saveMessages({ msgId: msgId, message: newMessage });
      setValue("");
      setTimeout(() => {
        ref.current.scroll({
          top: ref.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    },
    [currentUser, msgId, value]
  );

  return (
    <div className={`chat-window-cont`}>
      <div ref={ref} className="messages-box">
        {messages.map(({ msg, from, _id }) => {
          const isMyMsg = from === currentUser._id;
          return (
            <div
              key={_id}
              className="msg-box"
              style={{
                justifyContent: isMyMsg ? "flex-end" : "flex-start",
              }}
            >
              <div
                className={
                  isDarkTheme ? "single-message-box-dark" : `single-message-box`
                }
                style={{
                  borderRadius: isMyMsg
                    ? "20px 20px 2px 20px"
                    : "20px 20px 20px 2px",
                }}
              >
                {msg}
              </div>
            </div>
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

export default ChatWindow;
