import { useCallback, useEffect, useRef, useState } from "react";
import "./chatWindow.css";
import { useParams } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { v4 } from "uuid";

const ChatWindow = ({ allChats }) => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const messageref = useRef();

  useEffect(() => {
    const perChat = allChats.find((c) => c._id === id);
    console.log(`%c perChat `, "color: green;border:1px solid green", perChat);
    setMessages(perChat?.messages || []);
    const { messages, ...rest } = perChat || {};
    messageref.current = rest;
  }, [allChats, id]);

  console.log(
    `%c messages `,
    "color: yellow;border:1px solid lightgreen",
    messages
  );

  const handleMessages = useCallback(() => {
    if (!value) return;
    let a = Math.random() * 100;
    const { from } = messageref.current || {};
    setMessages((p) => [
      ...p,
      { [a > 50 ? "from" : "to"]: from._id, msg: value, id: v4() },
    ]);
    // setValue("");
  }, [value]);

  const { from: currentUser } = messageref.current || {};

  return (
    <div className={`chat-window-cont`}>
      <div className="messages-box">
        {messages.map(({ msg, from, id }) => {
          return (
            <div
              key={id}
              className="one-msg-box"
              style={{
                alignSelf:
                  from === currentUser?._id ? "flex-start" : "flex-end",
                textAlign: from === currentUser?._id ? "start" : "end",
              }}
            >
              {msg}
            </div>
          );
        })}
      </div>
      <div className="send-bar-bottom">
        <OutlinedInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ width: "80%", height: "80%", borderRadius: "30px" }}
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
