import Authorize from "./components/authorizeUser";
import { Route, Routes } from "react-router-dom";
import LoginScreen from "./components/loginScreen";
import { ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import { useEffect } from "react";

const socket = io("http://localhost:4000", {
  transports: ["websocket", "polling", "flashsocket"],
});
function App() {
  useEffect(() => {
    // Listen for messages from the server
    socket.on("CONNECTED", (id) => {
      window.socket_id = id;
    });
    socket.on("NEW_EMAIL_RECEIVED", (email) => {
      console.log(
        `%c NEW EMAIL RECEIVED `,
        "color: yellow;border:1px solid lightgreen",
        email
      );
    });
    // Clean up the socket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Authorize />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        limit={5}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="light"
      />
    </>
  );
}
export default App;
