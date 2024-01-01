import { emitter } from "../../utils/eventemitter";
import useAuth from "../../utils/useAuth";
import { Avatar, IconButton } from "@mui/material";

function LoggedInUserProfile() {
  const { user } = useAuth();

  return (
    <IconButton
      sx={{ padding: 0, all: "unset" }}
      disableRipple={true}
      size="small"
      onClick={() => emitter.emit("OPEN_DRAWER")}
    >
      <Avatar src={user?.picture} />
    </IconButton>
  );
}
export default LoggedInUserProfile;
