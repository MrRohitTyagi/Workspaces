import { useNavigate } from "react-router-dom";
import { memo, useCallback, useContext, useState } from "react";

import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

import { chatMEnuConfig, sideMenuConfig } from ".";
import { emitEvent } from "@/utils/eventemitter";
import { ThemeTypeContext } from "@/App";

const MobileAppMenu = memo(() => {
  const [open, setOpen] = useState(false);
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const navigate = useNavigate();

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <SpeedDial
      ariaLabel="SpeedDial basic example"
      sx={{ position: "fixed", bottom: 16, right: 16 }}
      className="SpeedDial tooltip example"
      icon={<SpeedDialIcon />}
      onClose={handleClose}
      onOpen={handleOpen}
      open={open}
    >
      {sideMenuConfig().map((menu, i) => (
        <SpeedDialAction
          open
          key={menu.name}
          icon={menu.icon}
          tooltipTitle={menu.label}
          tooltipOpen
          onClick={() => {
            if (i === 0) emitEvent(menu.event);
            else navigate(menu.navUrl);
            handleClose();
          }}
        />
      ))}
      {chatMEnuConfig(isDarkTheme).map((menu) => {
        return (
          <SpeedDialAction
            key={menu.label}
            icon={menu.icon}
            tooltipTitle={menu.tooltip}
            tooltipOpen
            onClick={() => {
              navigate(menu.navUrl);
              handleClose();
            }}
          />
        );
      })}
    </SpeedDial>
  );
});
MobileAppMenu.displayName = "MobileAppMenu";
export default MobileAppMenu;
