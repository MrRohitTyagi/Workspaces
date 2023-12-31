import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH_DOMAIN}
    clientId={import.meta.env.VITE_AUTH_CLIENT_ID}
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Auth0Provider>
);
