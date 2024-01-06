import React, { useContext } from "react";

import "./chatNotSelected.css";
import { ThemeTypeContext } from "@/App";
import useAuth from "@/utils/useAuth";

const ChatNotSelected = () => {
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const { user } = useAuth();
  return (
    <div
      className={`chat-not-selected ${isDarkTheme ? "dark-theme-light" : ""}`}
    >
      <h2>Welcome {user.username || user.email}</h2>
      <h4>Ready? Set. Chat! Let's jump right into things.</h4>
      <h5 style={{ color: "red" }}>This feature is Under development.</h5>
      <h5 style={{ color: "red" }}>NOT MOBILE RESPONSIVE</h5>
    </div>
  );
};

export default ChatNotSelected;
