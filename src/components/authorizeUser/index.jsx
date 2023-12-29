import { memo } from "react";
import SideMenu from "../SideMenu";
import Loader from "../Loader";
import TopNavbar from "../topNavbar";
import MainContainer from "../mainContainer";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ComposeEmail from "../ComposeEmail";

const Authorize = memo(() => {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader />;
  }
  if (!isAuthenticated) {
    return navigate("/login");
  }

  return (
    <>
      <TopNavbar />
      <div className="main-container">
        <SideMenu />
        <MainContainer />
      </div>
      <ComposeEmail />
    </>
  );
});
Authorize.displayName = "Authorize";
export default Authorize;
