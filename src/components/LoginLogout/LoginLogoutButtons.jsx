import { useDispatch } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Button, CircularProgress, Tooltip } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

import { memo } from "react";
import { SET_USER, setUser } from "../../redux/userReducer/userReducer";
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
  const dispatch = useDispatch();
  const { logout } = useAuth0();

  return (
    <Tooltip title="Logout">
      <Button
        size="small"
        variant="outlined"
        sx={{ gap: "5px" }}
        disableFocusRipple
        disableRipple
        color="inherit"
        onClick={() => {
          dispatch(setUser({}, SET_USER));
          logout({ logoutParams: { returnTo: window.location.origin } });
        }}
      >
        <LogoutIcon />
        Logout
      </Button>
    </Tooltip>
  );
});

const LoggedInUserProfile = memo(() => {
  const { user } = useAuth0();

  return <Avatar src={user?.picture} />;
});

LogoutButton.displayName = "LogoutButton";
LoggedInUserProfile.displayName = "LoggedInUserProfile";
LoginButton.displayName = "LoginLogutButton";

export default LoggedInUserProfile;
export { LogoutButton };
export { LoginButton };
