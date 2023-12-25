import { useDispatch } from "react-redux";
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

import { memo, useEffect } from "react";
import { SET_USER, setUser } from "../../redux/userReducer/userReducer";
import { confugureUser } from "../../controllers/userController";
import { emitEvent } from "../../utils/eventemitter";

const LoginLogutButton = memo(() => {
  const { isAuthenticated, isLoading, loginWithPopup } = useAuth0();

  if (isLoading)
    return (
      <>
        <CircularProgress color="inherit" />
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={open}
        ></Backdrop>
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
});

const LoggedInUserProfile = memo(() => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    (async function fetchUser() {
      if (user) {
        const { response } = await confugureUser(user.name, user.email);

        dispatch(
          setUser(
            {
              ...user,
              emailContent: response.emailContent,
              id: response._id,
            },
            SET_USER
          )
        );
        emitEvent("USER_FETCHED_SUCCESS");
      }
    })();
  }, [dispatch, user]);

  return isAuthenticated ? <Avatar src={user?.picture} /> : null;
});

const LogoutButton = memo(() => {
  const dispatch = useDispatch();
  const { logout } = useAuth0();

  return (
    <Tooltip title="Logout">
      <IconButton
        disableFocusRipple
        disableRipple
        color="inherit"
        onClick={() => {
          dispatch(setUser({}, SET_USER));
          logout({ logoutParams: { returnTo: window.location.origin } });
        }}
      >
        <LogoutIcon />
      </IconButton>
    </Tooltip>
  );
});

LogoutButton.displayName = "LogoutButton";
LoggedInUserProfile.displayName = "LoggedInUserProfile";
LoginLogutButton.displayName = "LoginLogutButton";

export { LoggedInUserProfile };
export { LogoutButton };
export default LoginLogutButton;
