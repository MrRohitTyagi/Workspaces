import React, { useContext } from "react";
import "./loader.css";
import { ThemeTypeContext } from "../../App";
const Loader = () => {
  const { isDarkTheme } = useContext(ThemeTypeContext) || {};
  return (
    <div
      className={`loader-container ${
        isDarkTheme ? "loader-container-dark" : ""
      }`}
    >
      <div className="loader"></div>
    </div>
  );
};

export default Loader;
