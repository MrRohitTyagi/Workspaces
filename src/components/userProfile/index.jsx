import { memo } from "react";
import { Avatar, IconButton } from "@mui/material";

import { emitter } from "@/utils/eventemitter";
import useAuth from "@/utils/useAuth";

const LoggedInUserProfile = memo(() => {
  const { user } = useAuth();

  return (
    <IconButton
      sx={{ padding: 0, all: "unset", cursor: "pointer" }}
      disableRipple={true}
      size="small"
      onClick={() => emitter.emit("OPEN_DRAWER")}
    >
      <Avatar src={user?.picture} />
    </IconButton>
  );
});
LoggedInUserProfile.displayName = "LoggedInUserProfile";
export default LoggedInUserProfile;
