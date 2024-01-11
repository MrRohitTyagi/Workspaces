import { memo, useContext } from "react";
import { motion } from "framer-motion";

import { ThemeTypeContext } from "@/App";
import useAuth from "@/utils/useAuth";

import "./chatNotSelected.css";

const ChatNotSelected = memo(() => {
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const { user } = useAuth();
  return (
    <motion.div
      className={`chat-not-selected ${isDarkTheme ? "dark-theme-light" : ""}`}
    >
      <motion.h2
        initial={{ scale: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        animate={{ scale: 1 }}
      >
        Welcome {user.username || user.email}
      </motion.h2>
      <motion.h4
        initial={{ scale: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        animate={{ scale: 1 }}
        style={{ textAlign: "center" }}
        className={isDarkTheme ? "l-t-svg" : ""}
      >
        Ready? Set. Chat! Let&apos;s jump right into things.
      </motion.h4>
      {/* <h5 style={{ color: "red" }}>This feature is Under development.</h5> */}
      {/* <h5 style={{ color: "red" }}>NOT MOBILE RESPONSIVE</h5> */}
    </motion.div>
  );
});

ChatNotSelected.displayName = "ChatNotSelected";

export default ChatNotSelected;
