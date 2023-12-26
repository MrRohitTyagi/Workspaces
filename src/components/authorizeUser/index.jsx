import { useEffect, useState } from "react";
import { emitter, listenToEvent } from "../../utils/eventemitter";
import SideMenu from "../SideMenu";
import Loader from "../Loader";
import TopNavbar from "../topNavbar";
import MainContainer from "../mainContainer";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import ComposeEmail from "../ComposeEmail";

const filterObj = { inbox: "received" };
const Authorize = () => {
  const location = useLocation();
  console.log(location);
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [key, setkey] = useState("");

  useEffect(() => {
    listenToEvent("USER_FETCHED_SUCCESS", () => {});
    listenToEvent("REFRESH_MAINCONT", () => {
      setkey(Math.random());
    });

    return () => {
      emitter.off("USER_FETCHED_SUCCESS");
    };
  }, []);

  if (isLoading) {
    return <Loader />;
  }
  if (!isAuthenticated) {
    return navigate("/login");
  }
  //  else {
  //   navigate("/inbox");
  // }

  return (
    <>
      <TopNavbar />
      <div className="main-container">
        <SideMenu />
        <MainContainer key={key} filterkey={filterObj["inbox"]} />
      </div>
      <ComposeEmail />
    </>
  );
};

export default Authorize;
