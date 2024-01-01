import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { emitter, listenToEvent } from "../../../utils/eventemitter";
import { deleteCookie } from "../../../utils/cookieHandler";

export default function RightDrawer() {
  const [state, setState] = React.useState(false);

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

  const list = React.useMemo(() => {
    return (
      <Box
        sx={{ width: 250 }}
        role="presentation"
        onClick={toggleDrawer}
        onKeyDown={toggleDrawer}
      >
        <List>
          <ListItem disablePadding disabled>
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
  }, [toggleDrawer]);

  return (
    <Drawer anchor={"right"} open={state} onClose={toggleDrawer}>
      {list}
    </Drawer>
  );
}
