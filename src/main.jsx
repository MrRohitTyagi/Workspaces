import ReactDOM from "react-dom/client";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "@/App.jsx";
import "./index.css";
import Authorize from "@/components/authorizeUser/index.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
    <BrowserRouter>
      <Authorize>
        <App />
      </Authorize>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
