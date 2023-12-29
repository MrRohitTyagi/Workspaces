import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Button, CircularProgress, Tooltip } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

import { memo } from "react";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
  const navigate = useNavigate();
  const { isLoading, loginWithPopup, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    navigate("/");
    return;
  }
  return (
    <Tooltip title="Login">
      <Button
        size="small"
        variant="outlined"
        onClick={() => loginWithPopup()}
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

  const handleLogout = () => {
    window.location.href = "/login";
    window.location.reload();
    logout();
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
  const { user } = useAuth0();
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
