import React, { useEffect } from "react";
import "./loginscreen.css";
import { motion } from "framer-motion";
import TopNavbar from "../topNavbar";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
const LoginScreen = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <div className="login-screen">
        <motion.h1
          initial={{ scale: 0, opacity: 0, filter: "blur(10px)", y: -100 }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1 }}
          className="main-heading"
        >
          WORKSPACES
        </motion.h1>
        <motion.h2
          className="please-sign-in"
          initial={{ scale: 0, opacity: 0, filter: "blur(5px)", y: 100 }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 }}
          style={{ textAlign: "center" }}
          transition={{ duration: 1 }}
        >
          Please sign in to continue
        </motion.h2>
      </div>
    </>
  );
};

export default LoginScreen;
