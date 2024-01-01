import { createContext, useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { getCookie } from "../../utils/cookieHandler";
import { getUser } from "../../controllers/userController";
import Loader from "../Loader";

const socket = io(import.meta.env.VITE_BE_BASE_URL, {
  transports: ["websocket", "polling", "flashsocket"],
});
const AuthProvider = createContext();
function Authorize({ children }) {
  const navigate = useNavigate();

  const [authObj, setauthObj] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: {},
  });

  useEffect(() => {
    // Listen for messages from the server
    socket.on("CONNECTED", (id) => {
      console.log("Socket-id", id);
      window.socket_id = id;
    });
    return () => {
      socket.disconnect();
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
  }, [navigate]);

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
}

export default Authorize;
export { AuthProvider, socket };
