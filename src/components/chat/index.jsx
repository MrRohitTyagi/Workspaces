import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { ThemeTypeContext } from "@/App";
import "./chatStyles.css";
import ChatSideMenu from "./components/chatSideMenu";
import ChatWindow from "./components/ChatWindow";
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
import { socket } from "@/components/authorizeUser";

const ChatIndex = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allChats, setAllChats] = useState([]);
  const { pathname } = useLocation();

  const params = useParams();

  const fetchAllChats = useCallback(async () => {
    const { response } = await getAllChatsPerUser(user._id);
    setAllChats(response);
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
  // const updateMessageWithId = useCallback(({ message_id, message }) => {
  //   setAllChats((prev) => {
  //     const chatArr = [];
  //     for (const chat of prev) {
  //       if (chat._id === message_id) {
  //         let obj = chat;
  //         obj.messages = [...obj.messages, message];
  //         chatArr.push(obj);
  //       } else chatArr.push(chat);
  //     }
  //     return chatArr;
  //   });
  // }, []);

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
        ({ to, from }) => to._id === data._id || from._id === data._id
      );
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

  useEffect(() => {
    listenToEvent("DELETE_CHATFROM_SIDEMENU", deleteChat);
    listenToEvent("ADD_NEW_CHAT", addNewChat);
    // listenToEvent("UPDATE_MESSAGES_PER_CHAT", updateMessageWithId);
    listenToEvent("NEW_MESSAGE_RECEIVED", handleChatSideMenuStatusUpdate);
    listenToEvent(
      "HANDLE_NEW_MESSAGE_RECEIVED_FOR_CHAT_SIDEBAR",
      handleChatSideMenuStatusUpdate
    );

    return () => {
      emitter.off("DELETE_CHATFROM_SIDEMENU", deleteChat);
      emitter.off("ADD_NEW_CHAT", addNewChat);
      // emitter.off("UPDATE_MESSAGES_PER_CHAT", updateMessageWithId);
      emitter.off(
        "HANDLE_NEW_MESSAGE_RECEIVED_FOR_CHAT_SIDEBAR",
        handleChatSideMenuStatusUpdate
      );
    };
  }, [addNewChat, handleChatSideMenuStatusUpdate, deleteChat]);

  const { isDarkTheme } = useContext(ThemeTypeContext);
  return (
    <div
      className={`chat-main-container ${isDarkTheme ? "chat-cont-dark" : ""}`}
    >
      <ChatSideMenu allChats={allChats} setAllChats={setAllChats} />
      <Routes>
        <Route path="/select" element={<ChatNotSelected />} />
        <Route path="/:id" element={<ChatWindow key={pathname} />} />
      </Routes>
    </div>
  );
};

export default ChatIndex;
