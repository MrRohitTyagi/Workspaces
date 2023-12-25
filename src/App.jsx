import { Auth0Provider } from "@auth0/auth0-react";
import TopNavBar from "./components/appBars/topnavbar";
import SideMenu from "./components/SideMenu";
import MainContainer from "./components/mainContainer";
import { Provider } from "react-redux";
import store from "./redux/store";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { emitter, listenToEvent } from "./utils/eventemitter";
import ComposeEmail from "./components/ComposeEmail";

function App() {
  const [appStatus, setAppStatus] = useState("LOADING");
  const [key, setkey] = useState("");
  useEffect(() => {
    listenToEvent("USER_FETCHED_SUCCESS", () => {
      setAppStatus("SHOW_EMAILS");
    });
    listenToEvent("REFRESH_MAINCONT", () => {
      setkey(Math.random());
    });

    return () => {
      emitter.off("USER_FETCHED_SUCCESS");
    };
  }, []);

  return (
    <Provider store={store}>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH_DOMAIN}
        clientId={import.meta.env.VITE_AUTH_CLIENT_ID}
        authorizationParams={{ redirect_uri: window.location.origin }}
      >
        <TopNavBar />
        <div className="main-container">
          <SideMenu />
          {appStatus === "SHOW_EMAILS" ? (
            <MainContainer key={key} />
          ) : appStatus === "LOADING" ? (
            <Loader />
          ) : 'SIGN IN TO CONTINUE'}
        </div>
        <ComposeEmail />
      </Auth0Provider>
    </Provider>
  );
}

export default App;
