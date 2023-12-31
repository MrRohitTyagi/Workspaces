import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LoginScreen from "./components/loginScreen";
import { ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import { useEffect } from "react";
import PerEmailScreen from "./components/singleEmailScreen";
import TopNavbar from "./components/topNavbar";
import { useAuth0 } from "@auth0/auth0-react";
import Loader from "./components/Loader";
import SideMenu from "./components/SideMenu";
import MainContainer from "./components/mainContainer";
import ComposeEmail from "./components/ComposeEmail";

const socket = io(import.meta.env.VITE_BE_BASE_URL, {
  transports: ["websocket", "polling", "flashsocket"],
});

function App() {
  const pathname = useLocation();
  const { isLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div key={pathname}>
      <TopNavbar />
      <div className="main-container">
        <SideMenu />
        <Routes>
          <Route path="/" element={<MainContainer />} />
          <Route path="/email/:id" element={<PerEmailScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/email/:id" element={<PerEmailScreen />} />
        </Routes>
      </div>
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        limit={5}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        theme="light"
      />
      <ComposeEmail />
    </div>
  );
}
export { socket };
export default App;
