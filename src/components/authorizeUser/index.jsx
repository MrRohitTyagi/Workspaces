import { memo } from "react";
import SideMenu from "../SideMenu";
import Loader from "../Loader";
import TopNavbar from "../topNavbar";
import MainContainer from "../mainContainer";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ComposeEmail from "../ComposeEmail";

const Authorize = memo(() => {
  return <></>;
});
Authorize.displayName = "Authorize";
export default Authorize;
