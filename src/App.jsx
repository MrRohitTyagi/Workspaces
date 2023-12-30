import Authorize from "./components/authorizeUser";
import { Route, Routes } from "react-router-dom";
import LoginScreen from "./components/loginScreen";
import { ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import { useEffect } from "react";
import PerEmailScreen from "./components/perEmailScreen";


const socket = io("https://workspaces-backend.vercel.app", {
  transports: ["websocket", "polling", "flashsocket"],
});

function App() {
  useEffect(() => {
    // Listen for messages from the server
    socket.on("CONNECTED", (id) => {
      console.log("id", id);
      window.socket_id = id;
    });
    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<Authorize />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/email/:id" element={<PerEmailScreen />} />
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
export { socket };
export default App;
