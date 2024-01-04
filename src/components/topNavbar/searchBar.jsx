import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { emitEvent } from "../../utils/eventemitter";
import "./topNavbar.css";
let isLoaded = false;

export default function SearchBar() {
  const [value, setvalue] = React.useState("");

  const handleSubmit = React.useCallback((e) => {
    if (e.keyCode === 13) e.preventDefault();
  }, []);

  React.useEffect(() => {
    // Set a timer for 500ms after the user stops typing
    const timerId = setTimeout(() => {
      if (isLoaded) {
        // Do something with the debounced value (e.g., make an API call)
        emitEvent("GLOBAL_SEARCH_QUERY", value.trim() || "");
      }
      isLoaded = true;
    }, 500);

    // Clear the timer if the user continues typing within 500ms
    return () => clearTimeout(timerId);
  }, [value]);

  const { isDarkTheme } = React.useContext(ThemeTypeContext) || {};
  return (
    <Paper
      className={isDarkTheme ? "search-bar-dark" : "search-bar"}
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <InputBase
        onKeyDown={handleSubmit}
        value={value}
        onChange={(e) => setvalue(e.target.value)}
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search By Sender"
        inputProps={{ "aria-label": "search By Sender" }}
      />
      <IconButton
        type="button"
        aria-label="search"
        size="small"
        onClick={() => setvalue("")}
      >
        <ClearIcon />
      </IconButton>
      <IconButton
        size="small"
        type="button"
        aria-label="search"
        onClick={(e) => handleSubmit(e, true)}
      >
        <SearchIcon />
      </IconButton>
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton color="primary" aria-label="directions">
        <PopoverPopupState />
      </IconButton>
    </Paper>
  );
}

import Typography from "@mui/material/Typography";
import Popover from "@mui/material/Popover";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";
import { ThemeTypeContext } from "../../App";

export function PopoverPopupState() {
  React.useEffect(() => {
    let ele = document.querySelector(".search-bar-selector");
    if (ele) ele.parentElement.style.padding = 0;
  }, []);

  return (
    <PopupState
      variant="popover"
      popupId="demo-popup-popover"
      style={{ padding: 0 }}
    >
      {(popupState) => (
        <div className="">
          <IconButton
            disableRipple
            size="small"
            variant="contained"
            {...bindTrigger(popupState)}
          >
            <TuneIcon />
          </IconButton>
          <Popover
            sx={{ mt: 2 }}
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Typography sx={{ p: 2 }}>More filters Coming soon ...</Typography>
          </Popover>
        </div>
      )}
    </PopupState>
  );
}
