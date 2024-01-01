import { styled, alpha } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";

import { emitEvent } from "../../utils/eventemitter";
import { memo, useCallback } from "react";

import SearchBar from "./searchBar";
import useAuth from "../../utils/useAuth";
import LoggedInUserProfile from "../userProfile";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const TopNavbar = memo(() => {
  const { isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated;
  const handleClick = useCallback(
    () => emitEvent("EXPAND_COLLAPSE_SIDEBAR"),
    []
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "transparent",
          color: "black",
          boxShadow: "none",
        }}
      >
        <Toolbar>
          <IconButton
            onClick={handleClick}
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2, display: { xs: "none", md: "flex" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h4"
            noWrap
            component="div"
            className="app-name"
            sx={{ display: { sm: "block", xs: "none" }, cursor: "pointer" }}
          >
            Workspaces
          </Typography>
          {isLoggedIn && (
            <Search>
              <SearchBar />
            </Search>
          )}
          <Box sx={{ flexGrow: 1 }} />

          {isLoggedIn && (
            <Box>
              <IconButton color="inherit">
                <LoggedInUserProfile />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
});

TopNavbar.displayName = "TopNavbar";
export default TopNavbar;
