import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { ThemeTypeContext } from "@/App";
import "./chatStyles.css";
import ChatSideMenu from "./components/chatSideMenu";
import ChatWindow from "./components/ChatWindow";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import ChatNotSelected from "./components/chatsNotrSelected";
import useAuth from "@/utils/useAuth";
import { getAllChatsPerUser, newChat } from "@/controllers/chatController";
import { emitter, listenToEvent } from "@/utils/eventemitter";

const ChatIndex = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allChats, setAllChats] = useState([]);

  useEffect(() => {
    (async function () {
      const { response } = await getAllChatsPerUser(user._id);
      setAllChats(response);
    })();
  }, [user]);

  const addNewChat = useCallback(
    async (data) => {
      const alreadyExistedChat = allChats.find(({ to }) => to._id === data._id);
      console.log("data alreadyExistedChat", { data, alreadyExistedChat });
      const payload = {
        to: data._id,
        from: user._id,
        messages: [],
      };
      if (alreadyExistedChat) {
        navigate(`/chats/${alreadyExistedChat._id}`);
      } else {
        const { response } = await newChat(payload);
        setAllChats((p) => [...p, response]);
        navigate(`/chats/${response._id}`);
      }
      emitter.emit("CLOSE_ADD_NEW_CHAT_POPUP");
    },
    [allChats, navigate, user._id]
  );

  const updateMessageWithId = useCallback(({ message_id, message }) => {
    setAllChats((prev) => {
      const chatArr = [];
      for (const chat of prev) {
        if (chat._id === message_id) {
          let obj = chat;
          obj.messages = [...obj.messages, message];
          chatArr.push(obj);
        } else chatArr.push(chat);
      }
      return chatArr;
    });
  }, []);

  useEffect(() => {
    listenToEvent("ADD_NEW_CHAT", addNewChat);
    listenToEvent("UPDATE_MESSAGES_PER_CHAT", updateMessageWithId);

    return () => {
      emitter.off("ADD_NEW_CHAT", addNewChat);
      emitter.off("UPDATE_MESSAGES_PER_CHAT", updateMessageWithId);
    };
  }, [addNewChat, allChats, updateMessageWithId, user]);

  const { pathname } = useLocation();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  return (
    <div
      className={`chat-main-container ${isDarkTheme ? "chat-cont-dark" : ""}`}
    >
      <ChatSideMenu allChats={allChats} />
      <Routes>
        <Route path="/select" element={<ChatNotSelected />} />
        <Route
          path="/:id"
          element={<ChatWindow allChats={allChats} key={pathname} />}
        />
      </Routes>
    </div>
  );
};

export default ChatIndex;
