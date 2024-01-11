import { memo, useContext } from "react";

import { ThemeTypeContext } from "@/App";
import "./loader.css";

const Loader = memo(() => {
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
});
Loader.displayName = "Loader";

export default Loader;
