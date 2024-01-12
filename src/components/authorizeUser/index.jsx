import { createContext, memo, useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { getCookie } from "@/utils/cookieHandler";
import { getUser } from "@/controllers/userController";
import Loader from "@/components/Loader/index.jsx";

import { io } from "socket.io-client";
import { emitter } from "@/utils/eventemitter";

const AuthProvider = createContext();
const socket = io(import.meta.env.VITE_BE_BASE_URL, {
  transports: ["websocket", "polling", "flashsocket"],
});
const Authorize = memo(({ children }) => {
  const navigate = useNavigate();

  const [authObj, setauthObj] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: {},
  });

  useEffect(() => {
    // Listen for messages from the server
    const user_id = getCookie();
    socket.on("CONNECTED", (id) => {
      window.socket_id = id;
      socket.emit("SAVE_SOCKET_ID", user_id);
    });

    //new chat message
    socket.on("NEW_MESSAGE_RECEIVED", (data) => {
      const { message_id } = data || {};
      emitter.emit(`NEW_MESSAGE_RECEIVED_${message_id}`, data);
      emitter.emit(`HANDLE_NEW_MESSAGE_RECEIVED_FOR_CHAT_SIDEBAR`, data);
    });

    //delete single message
    socket.on("DELETE_SINGLE_MESSAGE", (data) => {
      const { chat_id } = data || {};
      emitter.emit(`DELETE_SINGLE_MESSAGE_${chat_id}`, data);
    });

    //edited single message
    socket.on("EDITED_SINGLE_MESSAGE", (data) => {
      const { chat_id } = data || {};
      emitter.emit(`EDITED_SINGLE_MESSAGE_${chat_id}`, data);
    });

    socket.on("SHOW_TYPING_EFFECT", (data) => {
      const { chat_id } = data || {};
      emitter.emit(`SHOW_TYPING_EFFECT_${chat_id}`, data);
      emitter.emit("SIDE_MENU_TYPING_EFFECT", data);
    });

    // new Email received
    socket.on("NEW_EMAIL_RECEIVED", (email) => {
      emitter.emit("INCREASE_NEW_EMAIL_COUNT");
      emitter.emit("NEW_EMAIL_RECEIVED", email);
    });

    //GROUP SOCKETS

    socket.on("SHOW_GROUP_TYPING_EFFECT", (data) => {
      const { group_id } = data || {};
      emitter.emit(`SHOW_GROUP_TYPING_EFFECT_${group_id}`, data);
      emitter.emit("GROUP_SIDE_MENU_TYPING_EFFECT", data);
    });
    socket.on("NEW_GROUP_MESSAGE", (data) => {
      const { group_id, message } = data || {};
      emitter.emit(`NEW_GROUP_MESSAGE_${group_id}`, message);
    });
    socket.on("GROUP_MESSAGE_DELETED", (data) => {
      const { group_id } = data || {};
      emitter.emit(`GROUP_MESSAGE_DELETED_${group_id}`, data);
    });
    socket.on("U_GOT_ADDED_IN_A_GROUP", (data) => {
      emitter.emit(`U_GOT_ADDED_IN_A_GROUP`, data);
    });
    socket.on("GROUP_DELETED_BY_ADMIN", (data) => {
      emitter.emit(`GROUP_DELETED_BY_ADMIN`, data);
    });

    return () => {
      socket.disconnect(user_id);
    };
  }, []);

  useEffect(() => {
    (async function authenticateUser() {
      const userCookieId = getCookie();
      const { response } = await getUser({
        id: userCookieId || "NONE",
        type: "AUTHORIZE",
      });

      if (isEmpty(response)) {
        setauthObj({
          isLoading: false,
          isAuthenticated: false,
          user: response,
        });
        navigate("/login");
      } else {
        setauthObj({ isLoading: false, isAuthenticated: true, user: response });
      }
    })();
  }, []);

  return (
    <AuthProvider.Provider
      value={{
        isLoading: authObj.isLoading,
        isAuthenticated: authObj.isAuthenticated,
        user: authObj.user,
      }}
    >
      {authObj.isLoading ? <Loader /> : children}
    </AuthProvider.Provider>
  );
});
Authorize.propTypes = {
  children: PropTypes.node,
};
Authorize.displayName = "Authorize";
export default Authorize;
export { AuthProvider };

export { socket };
