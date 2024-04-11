import { memo, useCallback, useContext, useEffect, useState } from "react";

import { ThemeTypeContext } from "@/App";
import "./chatStyles.css";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import ChatNotSelected from "./components/chatsNotrSelected";
import useAuth from "@/utils/useAuth";
import {
  getAllChatsPerUser,
  getUserChat,
  newChat,
} from "@/controllers/chatController";
import { emitter, listenToEvent } from "@/utils/eventemitter";
import useWindowDimens from "@/utils/useWindowDimens";

import ChatSideMenu from "./components/chatSideMenu";
import ChatWindow from "./components/ChatWindow";

const ChatIndex = memo(() => {
  const [allChats, setAllChats] = useState([]);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { user } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const innerWidth = useWindowDimens();

  const params = useParams();

  const fetchAllChats = useCallback(async () => {
    const { response } = await getAllChatsPerUser(user._id);
    setAllChats(response || []);
  }, [user]);

  useEffect(() => {
    (async function () {
      fetchAllChats();
    })();
  }, [fetchAllChats]);

  const deleteChat = useCallback(
    ({ message_id }) => {
      setAllChats((prev) => prev.filter((c) => c._id !== message_id));
      navigate("/chats/select");
    },
    [navigate]
  );

  const handleChatSideMenuStatusUpdate = useCallback(
    async (data) => {
      const { message_id } = data || {};
      const chatAlreadyAdded = allChats.find((c) => c._id === message_id);
      if (!chatAlreadyAdded) {
        const { response: newChat } = await getUserChat(message_id);
        setAllChats((prev) => [{ ...newChat, newMsgCount: 1 }, ...prev]);
        return;
      }

      setAllChats((prev) => {
        let isUserOnDifferentChat = false;
        const chatArr = [];
        for (const chat of prev) {
          if (chat._id === message_id) {
            let obj = chat;
            if (params?.["*"] !== obj._id) {
              isUserOnDifferentChat = true;
              obj.newMsgCount = (obj.newMsgCount ?? 0) + 1;
            }
            chatArr.push(obj);
          } else chatArr.push(chat);
        }

        if (isUserOnDifferentChat) return chatArr;
        else return prev;
      });
    },
    [allChats, params]
  );

  const addNewChat = useCallback(
    async (data) => {
      const alreadyExistedChat = allChats.find(
        ({ to, from }) => to?._id === data?._id || from?._id === data._id
      );
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

  useEffect(() => {
    listenToEvent("DELETE_CHATFROM_SIDEMENU", deleteChat);
    listenToEvent("ADD_NEW_CHAT", addNewChat);
    listenToEvent("NEW_MESSAGE_RECEIVED", handleChatSideMenuStatusUpdate);
    listenToEvent(
      "HANDLE_NEW_MESSAGE_RECEIVED_FOR_CHAT_SIDEBAR",
      handleChatSideMenuStatusUpdate
    );

    return () => {
      emitter.off("DELETE_CHATFROM_SIDEMENU", deleteChat);
      emitter.off("ADD_NEW_CHAT", addNewChat);
      emitter.off("NEW_MESSAGE_RECEIVED", handleChatSideMenuStatusUpdate);
      emitter.off(
        "HANDLE_NEW_MESSAGE_RECEIVED_FOR_CHAT_SIDEBAR",
        handleChatSideMenuStatusUpdate
      );
    };
  }, [addNewChat, handleChatSideMenuStatusUpdate, deleteChat]);

  return (
    <div
      className={`chat-main-container ${isDarkTheme ? "chat-cont-dark" : ""}`}
    >
      {innerWidth > 750 && (
        <ChatSideMenu allChats={allChats} setAllChats={setAllChats} />
      )}
      <Routes>
        <Route
          path="/select"
          element={
            innerWidth > 750 ? (
              <ChatNotSelected />
            ) : (
              <ChatSideMenu allChats={allChats} setAllChats={setAllChats} />
            )
          }
        />
        <Route path="/:id" element={<ChatWindow key={pathname} />} />
      </Routes>
    </div>
  );
});
ChatIndex.displayName = "ChatIndex";
export default ChatIndex;
