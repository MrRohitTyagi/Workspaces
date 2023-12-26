import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import TopNavBar from "./components/topNavbar";
import SideMenu from "./components/SideMenu";
import MainContainer from "./components/mainContainer";
import { Provider } from "react-redux";
import store from "./redux/store";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { emitter, listenToEvent } from "./utils/eventemitter";
import ComposeEmail from "./components/ComposeEmail";
import Authorize from "./components/authorizeUser";
import { Route, Routes } from "react-router-dom";
import LoginScreen from "./components/loginScreen";
import TopNavbar from "./components/topNavbar";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Authorize />} />
      <Route path="/login" element={<LoginScreen />} />
    </Routes>
  );
}

export default App;
