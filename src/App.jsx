import { createContext, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import PerEmailScreen from "@/components/singleEmailScreen";
import TopNavbar from "@/components/topNavbar";
import Loader from "@/components/Loader";
import SideMenu from "@/components/SideMenu";
import ComposeEmail from "@/components/ComposeEmail";
import MainContainer from "@/components/mainContainer";
import LoginScreen from "@/components/loginScreen";
import RightDrawer from "@/components/coreComponents/RightDrawer";
import UserSettings from "@/components/userSettings";
import ChatIndex from "@/components/chat/index.jsx";

import useAuth from "@/utils/useAuth";
import { emitter, listenToEvent } from "@/utils/eventemitter";

const ThemeTypeContext = createContext();
function App() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [isDarkTheme, setIsDarkTheme] = useState(user.isDarkTheme);
  const pathname = useLocation();

  useEffect(() => {
    listenToEvent("SWITCH_THEME", () => setIsDarkTheme((p) => !p));
    return () => {
      emitter.off("SWITCH_THEME", () => {});
    };
  }, []);

  return (
    <ThemeTypeContext.Provider value={{ isDarkTheme }}>
      <div key={pathname}>
        <TopNavbar />
        {isLoading ? (
          <Loader />
        ) : (
          <div
            className={`main-container ${
              isDarkTheme ? "d-t-l main-container-t-w" : ""
            }`}
          >
            {isAuthenticated && <SideMenu />}
            <Routes>
              <Route
                path="/inbox"
                element={<MainContainer key={`inbox-${pathname}`} />}
              />
              <Route
                path="/star"
                element={<MainContainer key={`star-${pathname}`} />}
              />
              <Route
                path="/sent"
                element={<MainContainer key={`sent-${pathname}`} />}
              />
              <Route
                path="/archived"
                element={<MainContainer key={`archived-${pathname}`} />}
              />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/email/:id" element={<PerEmailScreen />} />
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/chats/*" element={<ChatIndex />} />
              <Route path="/*" element={<Redirect />} />
            </Routes>
          </div>
        )}
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
        <RightDrawer />
      </div>
    </ThemeTypeContext.Provider>
  );
}
const Redirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/inbox");
  });
  return <></>;
};

export { ThemeTypeContext };
export default App;
