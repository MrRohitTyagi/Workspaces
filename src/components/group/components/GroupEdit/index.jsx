/* eslint-disable react/prop-types */
import {
  Avatar,
  Button,
  Chip,
  IconButton,
  MenuItem,
  MenuList,
} from "@mui/material";
import "./groupedit.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "@/utils/useAuth";
import Menu from "@mui/material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
const GroupEdit = ({ allGroups }) => {
  const { id: group_id } = useParams();
  const { user } = useAuth();
  const [perGroup, setperGroup] = useState({});

  useEffect(() => {
    let grp = allGroups.find((g) => g._id === group_id) || {};
    if (!grp._id) return;
    console.log("grp", grp);
    grp.members = grp.members.reverse();
    setperGroup(grp);
  }, [allGroups, group_id]);

  const deleteGroup = () => {
    updateGroup({
      type: "DELETE_GROUP",
      group_id: perGroup._id,
    });
    // emitter.emit("DELETE_GROUP", { group_id });
  };
  return (
    <div className="group-edit-container">
      <Avatar src={perGroup.picture} sx={{ height: "150px", width: "150px" }} />
      <h3>{perGroup.title}</h3>
      <h4 style={{ textAlign: "center", wordWrap: "break-word" }}>
        {perGroup.description}
      </h4>
      <div className="grp-edit-members-box">
        <div className="header" style={{ opacity: "50%" }}>
          {perGroup?.members?.length} {" Members"}
        </div>
        <MenuList
          id="basic-menu"
          open={open}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {(perGroup?.members || [])?.map((member, i) => {
            const { _id, username, email, picture } = member;
            const isAdmin = perGroup?.admins?.includes(_id);

            // const lastMessage = {msg:'hello'};
            return (
              <MenuItem
                disableRipple
                key={_id}
                onClick={() => {}}
                sx={{
                  background: "transparent",
                }}
              >
                <motion.div
                  className="per-chat-line"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {i + 1}
                  <Avatar
                    src={picture}
                    sx={{ height: "35px", width: "35px" }}
                  />

                  <motion.div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <h5>{username || `${email?.slice(0, 15)}...`}</h5>{" "}
                    {isAdmin && (
                      <Chip
                        size="small"
                        label="Admin"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </motion.div>
                </motion.div>
                {perGroup?.admins?.includes(user._id) && (
                  <UserSettings
                    member={member}
                    perGroup={perGroup}
                    isAdmin={isAdmin}
                    setperGroup={setperGroup}
                  />
                )}
              </MenuItem>
            );
          })}
        </MenuList>
        {perGroup?.admins?.includes(user._id) && (
          <Button
            sx={{ alignSelf: "start" }}
            variant="outlined"
            color="error"
            onClick={deleteGroup}
          >
            Delete Group
          </Button>
        )}
      </div>
    </div>
  );
};
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { updateGroup } from "@/controllers/groupController";
import { emitter } from "@/utils/eventemitter";
function UserSettings({ member, perGroup, isAdmin, setperGroup }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const revokeAdmin = () => {
    setperGroup((prev) => {
      let obj = prev;
      obj.admins = obj.admins.filter((a) => a !== member._id);
      return { ...obj };
    });
    updateGroup({
      type: "REVOKE_ADMIN",
      group_id: perGroup._id,
      member_id: member._id,
    });
  };
  const makeAdmin = () => {
    setperGroup((prev) => {
      let obj = prev;
      obj.admins = [...obj.admins, member._id];
      return { ...obj };
    });
    updateGroup({
      type: "MAKE_ADMIN",
      group_id: perGroup._id,
      member_id: member._id,
    });
  };
  const removeFromGroup = () => {
    setperGroup((prev) => {
      let obj = prev;
      obj.members = obj.members.filter((a) => a._id !== member._id);
      obj.admins = obj.admins.filter((a) => a !== member._id);
      return { ...obj };
    });
  };

  return (
    <div>
      <IconButton
        size="small"
        id="demo-positioned-button"
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <SettingsIcon />
      </IconButton>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "left",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {isAdmin ? (
          <MenuItem sx={{ gap: "10px" }} onClick={revokeAdmin}>
            <RemoveCircleIcon /> Revoke Admin
          </MenuItem>
        ) : (
          <MenuItem onClick={makeAdmin} sx={{ gap: "10px" }}>
            <AdminPanelSettingsIcon fontSize="small" />
            Make Admin
          </MenuItem>
        )}
        <MenuItem sx={{ gap: "10px" }} onClick={removeFromGroup}>
          <DeleteForeverIcon /> Remove from group
        </MenuItem>
      </Menu>
    </div>
  );
}

export default GroupEdit;
