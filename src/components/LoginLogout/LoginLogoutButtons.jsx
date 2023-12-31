import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Button, CircularProgress, Tooltip } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

import { memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
  const { isLoading, loginWithPopup, isAuthenticated, handleRedirectCallback } =
    useAuth0();

  if (isAuthenticated) {
    return null;
  }
  const handleLogin = () => {
    loginWithPopup();
  };
  return (
    <Tooltip title="Login">
      <Button
        size="small"
        variant="outlined"
        onClick={handleLogin}
        disableFocusRipple
        disableRipple
        color="inherit"
        sx={{ gap: "5px" }}
      >
        {isLoading ? (
          <>
            <CircularProgress size="22px" />
            Loading...
          </>
        ) : (
          <>
            <LoginIcon /> Login
          </>
        )}
      </Button>
    </Tooltip>
  );
};
const LogoutButton = memo(() => {
  const { logout, isLoading } = useAuth0();

  const handleLogout = async () => {
    await logout();
    window.location.reload();
    window.location.href = "/login";
  };
  return (
    <Tooltip title="Logout">
      <Button
        size="small"
        variant="outlined"
        sx={{ gap: "5px" }}
        disableFocusRipple
        disableRipple
        color="inherit"
        onClick={handleLogout}
      >
        {isLoading ? (
          <>
            <CircularProgress size="22px" />
            Loading...
          </>
        ) : (
          <>
            <LogoutIcon /> Logout
          </>
        )}
      </Button>
    </Tooltip>
  );
});

import Popover from "@mui/material/Popover";
import PopupState, { bindTrigger, bindPopover } from "material-ui-popup-state";

export function LoggedInUserProfile() {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  return (
    <PopupState variant="popover" popupId="demo-popup-popover-profile">
      {(popupState) => (
        <div>
          <Avatar src={user?.picture} {...bindTrigger(popupState)} />

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
            <LogoutButton />
          </Popover>
        </div>
      )}
    </PopupState>
  );
}

LogoutButton.displayName = "LogoutButton";
LoggedInUserProfile.displayName = "LoggedInUserProfile";
LoginButton.displayName = "LoginLogutButton";

export default LoggedInUserProfile;
export { LogoutButton };
export { LoginButton };
