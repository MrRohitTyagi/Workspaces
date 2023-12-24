import { useAuth0 } from "@auth0/auth0-react";
import {
  Avatar,
  Backdrop,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

import LoadingButton from "@mui/lab/LoadingButton";

const LoginLogutButton = () => {
  const { isAuthenticated, isLoading, loginWithPopup } = useAuth0();

  if (isLoading)
    return (
      <>
        <CircularProgress color="inherit" />
        {/* <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={open}
        >
          <CircularProgress color="inherit" />
        </Backdrop> */}
      </>
    );

  return isAuthenticated ? (
    <LogoutButton />
  ) : (
    <Tooltip title="Login">
      <IconButton
        onClick={() => loginWithPopup()}
        disableFocusRipple
        disableRipple
        color="inherit"
      >
        <LoginIcon />
      </IconButton>
    </Tooltip>
  );
};

const LoggedInUserProfile = () => {
  const { user, isAuthenticated } = useAuth0();
  console.log(user);
  return isAuthenticated ? <Avatar src={user?.picture} /> : null;
};

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Tooltip title="Logout">
      <IconButton
        disableFocusRipple
        disableRipple
        color="inherit"
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        <LogoutIcon />
      </IconButton>
    </Tooltip>
  );
};

export { LoggedInUserProfile };
export { LogoutButton };
export default LoginLogutButton;
