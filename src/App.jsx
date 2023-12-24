import { Auth0Provider } from "@auth0/auth0-react";
import TopNavBar from "./components/appBars/topnavbar";
import SideMenu from "./components/SideMenu";
import MainContainer from "./components/mainContainer";

function App() {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH_DOMAIN}
      clientId={import.meta.env.VITE_AUTH_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <TopNavBar />
      <div className="main-container">
        <SideMenu />
        <MainContainer />
      </div>
    </Auth0Provider>
  );
}

export default App;
