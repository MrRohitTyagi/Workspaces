import { useCallback, useContext, useEffect, useState } from "react";

import { ThemeTypeContext } from "@/App";
import "./groupStyles.css";
import GroupSideMenu from "./components/groupSideMenu";
import GroupWindow from "./components/groupWindow";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import GroupNotSelected from "./components/groupNotrSelected";
import useAuth from "@/utils/useAuth";

import {
  getAllChatsPerUser,
  getUserChat,
  newChat,
} from "@/controllers/chatController";

import { emitter, listenToEvent } from "@/utils/eventemitter";
import useWindowDimens from "@/utils/useWindowDimens";
import { createGroup, getAllGroupsOfUser } from "@/controllers/groupController";
import { uploadImage } from "@/utils/imageupload";

const ChatIndex = () => {
  const [allGroups, setAllGroups] = useState([]);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { user } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const innerWidth = useWindowDimens();

  const params = useParams();

  const fetchAllGroups = useCallback(async () => {
    // const { response } = await getAllChatsPerUser(user._id);
    const { response } = await getAllGroupsOfUser(user._id);

    setAllGroups(response || []);
  }, [user]);

  useEffect(() => {
    (async function () {
      fetchAllGroups();
    })();
  }, [fetchAllGroups]);

  const deleteChat = useCallback(
    ({ message_id }) => {
      setAllGroups((prev) => prev.filter((c) => c._id !== message_id));
      navigate("/groups/select");
    },
    [navigate]
  );

  const handleChatSideMenuStatusUpdate = useCallback(
    async (data) => {
      const { message_id } = data || {};
      const chatAlreadyAdded = allGroups.find((c) => c._id === message_id);
      if (!chatAlreadyAdded) {
        const { response: newChat } = await getUserChat(message_id);
        setAllGroups((prev) => [{ ...newChat, newMsgCount: 1 }, ...prev]);
        return;
      }

      setAllGroups((prev) => {
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
    [allGroups, params]
  );

  const addNewGroup = useCallback(
    async (group) => {
      let imageUrl = "";
      if (group.picture) {
        imageUrl = await uploadImage(group.picture);
      }
      const payload = {
        ...group,
        members: group.members.map((m) => m._id),
        picture: imageUrl,
      };
      const { response } = await createGroup(payload);
      console.log(`%c group `, "color: lightblue;border:1px solid lightblue", {
        group,
        payload,
        response,
      });
      setAllGroups((p) => [...p, response]);
      navigate(`/groups/${response._id}`);

      // emitter.emit("CLOSE_ADD_NEW_CHAT_POPUP");
    },
    [navigate]
  );

  useEffect(() => {
    listenToEvent("DELETE_CHATFROM_SIDEMENU", deleteChat);
    listenToEvent("ADD_NEW_GROUP", addNewGroup);
    listenToEvent("NEW_MESSAGE_RECEIVED", handleChatSideMenuStatusUpdate);
    listenToEvent(
      "HANDLE_NEW_MESSAGE_RECEIVED_FOR_CHAT_SIDEBAR",
      handleChatSideMenuStatusUpdate
    );

    return () => {
      emitter.off("DELETE_CHATFROM_SIDEMENU", deleteChat);
      emitter.off("ADD_NEW_GROUP", addNewGroup);
      emitter.off("NEW_MESSAGE_RECEIVED", handleChatSideMenuStatusUpdate);
      emitter.off(
        "HANDLE_NEW_MESSAGE_RECEIVED_FOR_CHAT_SIDEBAR",
        handleChatSideMenuStatusUpdate
      );
    };
  }, [addNewGroup, handleChatSideMenuStatusUpdate, deleteChat]);

  return (
    <div
      className={`chat-main-container ${isDarkTheme ? "chat-cont-dark" : ""}`}
    >
      {innerWidth > 750 && (
        <GroupSideMenu allGroups={allGroups} setAllGroups={setAllGroups} />
      )}
      <Routes>
        <Route
          path="/select"
          element={
            innerWidth > 750 ? (
              <GroupNotSelected />
            ) : (
              <GroupSideMenu
                allGroups={allGroups}
                setAllGroups={setAllGroups}
              />
            )
          }
        />
        <Route path="/:id" element={<GroupWindow key={pathname} />} />
      </Routes>
    </div>
  );
};

export default ChatIndex;
