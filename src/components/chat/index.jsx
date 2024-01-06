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
import { getAllChatsPerUser, newChat } from "@/controllers/chatController";
import { emitter, listenToEvent } from "@/utils/eventemitter";
import { socket } from "@/components/authorizeUser";

const ChatIndex = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allChats, setAllChats] = useState([]);
  const { pathname } = useLocation();

  const params = useParams();

  useEffect(() => {
    (async function () {
      const { response } = await getAllChatsPerUser(user._id);
      setAllChats(response);
    })();
  }, [user]);

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

  const updateMessageWithIdFromSocket = useCallback(
    ({ message_id, message }) => {
      setAllChats((prev) => {
        const chatArr = [];
        for (const chat of prev) {
          if (chat._id === message_id) {
            let obj = chat;
            obj.messages = [...obj.messages, message];
            if (params?.["*"] !== obj._id) {
              obj.newMsgCount = (obj.newMsgCount ?? 0) + 1;
            }
            chatArr.push(obj);
          } else chatArr.push(chat);
        }
        return chatArr;
      });
    },
    [params]
  );

  const addNewchatFromSocket = useCallback(
    (data) => {
      const { message_id, message } = data || {};

      updateMessageWithIdFromSocket({ message_id, message });
    },
    [updateMessageWithIdFromSocket]
  );

  useEffect(() => {
    // Listen for messages from the server
    socket.on("NEW_MESSAGE_RECEIVED", (data) => {
      console.log("NEW_MESSAGE_RECEIVED", data);
      addNewchatFromSocket(data);

      return () => {
        console.log("UNMOIUNTED");
      };
    });
  }, []);

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
    listenToEvent("ADD_NEW_CHAT", addNewChat);
    listenToEvent("UPDATE_MESSAGES_PER_CHAT", updateMessageWithId);

    return () => {
      emitter.off("ADD_NEW_CHAT", addNewChat);
      emitter.off("UPDATE_MESSAGES_PER_CHAT", updateMessageWithId);
    };
  }, [addNewChat, updateMessageWithId]);

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
