import { Route, Routes, useLocation } from "react-router-dom";
import LoginScreen from "./components/loginScreen";
import { ToastContainer } from "react-toastify";

import PerEmailScreen from "./components/singleEmailScreen";
import TopNavbar from "./components/topNavbar";

import Loader from "./components/Loader";
import SideMenu from "./components/SideMenu";
import MainContainer from "./components/mainContainer";
import ComposeEmail from "./components/ComposeEmail";
import useAuth from "./utils/useAuth";
import RightDrawer from "./components/coreComponents/RightDrawer";

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = useLocation();

  return (
    <div key={pathname}>
      <TopNavbar />
      {isLoading ? (
        <Loader />
      ) : (
        <div className="main-container">
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
            <Route path="/email/:id" element={<PerEmailScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/email/:id" element={<PerEmailScreen />} />
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
  );
}

export default App;
