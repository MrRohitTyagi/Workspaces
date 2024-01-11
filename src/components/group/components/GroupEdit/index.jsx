import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
/* eslint-disable react/prop-types */

import {
  Avatar,
  Button,
  Chip,
  IconButton,
  MenuItem,
  MenuList,
} from "@mui/material";
import Menu from "@mui/material/Menu";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SettingsIcon from "@mui/icons-material/Settings";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import useAuth from "@/utils/useAuth";
import { updateGroup } from "@/controllers/groupController";
import "./groupedit.css";

const GroupEdit = memo(({ allGroups }) => {
  const { id: group_id } = useParams();
  const { user } = useAuth();
  const [perGroup, setperGroup] = useState({});

  useEffect(() => {
    let grp = allGroups.find((g) => g._id === group_id) || {};
    if (!grp._id) return;
    grp.members = grp.members.reverse();
    setperGroup(grp);
  }, [allGroups, group_id]);

  const deleteGroup = useCallback(() => {
    updateGroup({
      type: "DELETE_GROUP",
      group_id: perGroup._id,
    });
  }, [perGroup._id]);

  return (
    <div className="group-edit-container">
      <motion.div
        initial={{ scale: 0, y: -100 }}
        transition={{ duration: 0.5, type: "spring" }}
        animate={{ scale: 1, y: 0 }}
      >
        <Avatar
          src={perGroup.picture}
          sx={{ height: "150px", width: "150px" }}
        />
      </motion.div>
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
                  <motion.div
                    initial={{ scale: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    animate={{ scale: 1 }}
                  >
                    <Avatar
                      src={picture}
                      sx={{ height: "35px", width: "35px" }}
                    />
                  </motion.div>

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
});

const UserSettings = memo(({ member, perGroup, isAdmin, setperGroup }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const revokeAdmin = useCallback(() => {
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
  }, [member._id, perGroup._id, setperGroup]);

  const makeAdmin = useCallback(() => {
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
  }, [member._id, perGroup._id, setperGroup]);

  const removeFromGroup = useCallback(() => {
    setperGroup((prev) => {
      let obj = prev;
      obj.members = obj.members.filter((a) => a._id !== member._id);
      obj.admins = obj.admins.filter((a) => a !== member._id);
      return { ...obj };
    });
  }, [member._id, setperGroup]);

  return (
    <motion.div
      initial={{ rotate: 90 }}
      transition={{ duration: 2, type: "spring" }}
      animate={{ rotate: 0 }}
    >
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
        <MenuItem sx={{ gap: "10px" }} onClick={removeFromGroup}>
          <DeleteForeverIcon /> Leave Group
        </MenuItem>
      </Menu>
    </motion.div>
  );
});

GroupEdit.displayName = "GroupEdit";
UserSettings.displayName = "UserSettings";
export default GroupEdit;
