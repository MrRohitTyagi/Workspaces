import { useContext, useEffect, useRef, useState } from "react";

import { ThemeTypeContext } from "@/App";
import "./chatStyles.css";
import ChatSideMenu from "./components/chatSideMenu";
import ChatWindow from "./components/ChatWindow";
import { Route, Routes } from "react-router-dom";
import ChatNotSelected from "./components/chatsNotrSelected";
import useAuth from "@/utils/useAuth";
import { getAllChatsPerUser } from "@/controllers/chatController";

const ChatIndex = () => {
  const { user } = useAuth();
  const [allChats, setAllChats] = useState([]);


  useEffect(() => {
    (async function () {
      const { response } = await getAllChatsPerUser(user._id);
      setAllChats(response);
    })();
  }, [user]);

  const { isDarkTheme } = useContext(ThemeTypeContext);
  return (
    <div
      className={`chat-main-container ${isDarkTheme ? "chat-cont-dark" : ""}`}
    >
      <ChatSideMenu allChats={allChats}  />
      <Routes>
        <Route path="/select" element={<ChatNotSelected />} />
        <Route
          path="/:id"
          element={
            <ChatWindow allChats={allChats}  />
          }
        />
      </Routes>
    </div>
  );
};

export default ChatIndex;
