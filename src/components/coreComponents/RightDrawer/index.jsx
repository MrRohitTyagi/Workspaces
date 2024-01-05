import { useNavigate } from "react-router-dom";
import * as React from "react";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ColorLensIcon from "@mui/icons-material/ColorLens";

import { emitter, listenToEvent } from "@/utils/eventemitter";
import { updateUser } from "@/controllers/userController";
import { deleteCookie } from "@/utils/cookieHandler";
import useAuth from "@/utils/useAuth";

export default function RightDrawer() {
  const [state, setState] = React.useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    listenToEvent("OPEN_DRAWER", () => setState(true));
    return () => emitter.off("OPEN_DRAWER", () => {});
  }, []);

  const toggleDrawer = React.useCallback((event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState((p) => !p);
  }, []);

  const handleLogout = () => {
    deleteCookie();
    window.location.href = "/login";
    window.location.reload();
  };

  const handleThemeSwitch = React.useCallback(() => {
    emitter.emit("SWITCH_THEME");
    updateUser({ key: "isDarkTheme", value: !user.isDarkTheme, id: user._id });
  }, [user]);

  const list = React.useMemo(() => {
    return (
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={toggleDrawer}
        onKeyDown={toggleDrawer}
      >
        <List>
          <ListItem
            disablePadding
            onClick={() => navigate("/settings")}
            disabled
          >
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={"Settings"} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding onClick={handleThemeSwitch}>
            <ListItemButton>
              <ListItemIcon>
                <ColorLensIcon />
              </ListItemIcon>
              <ListItemText primary={"Switch Theme"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding onClick={handleLogout}>
            <ListItemButton>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary={"Logout"} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    );
  }, [handleThemeSwitch, navigate, toggleDrawer]);

  return (
    <Drawer anchor={"right"} open={state} onClose={toggleDrawer}>
      {list}
    </Drawer>
  );
}
