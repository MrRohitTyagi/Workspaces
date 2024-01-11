import { motion } from "framer-motion";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

/* eslint-disable react/prop-types */

import {
  Avatar,
  Button,
  Chip,
  IconButton,
  MenuItem,
  MenuList,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import Menu from "@mui/material/Menu";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SettingsIcon from "@mui/icons-material/Settings";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import { emitter } from "@/utils/eventemitter";
import useAuth from "@/utils/useAuth";
import { updateGroup } from "@/controllers/groupController";
import "./groupedit.css";
import { ThemeTypeContext } from "@/App";
import { formatCustomDate } from "@/utils/helperFunctions";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupMembersAdd from "./GroupMembersAdd";
import { unionBy } from "lodash";
const GroupEdit = memo(({ allGroups }) => {
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const navigate = useNavigate();
  const { id: group_id } = useParams();
  const { user } = useAuth();
  const [perGroup, setperGroup] = useState({});

  useEffect(() => {
    let grp = allGroups.find((g) => g._id === group_id) || {};
    if (!grp._id) return;
    setperGroup(grp);
  }, [allGroups, group_id]);

  const handleAddNewMembers = useCallback(
    (members) => {
      updateGroup({
        type: "ADD_MEMBERS",
        group_id: perGroup._id,
        newMembers: members.map((m) => m._id),
      });
      setperGroup((prev) => {
        let obj = { ...prev };
        obj.members = unionBy(obj.members, members, "_id");
        return obj;
      });
    },
    [perGroup._id]
  );

  const deleteGroup = useCallback(() => {
    updateGroup({
      type: "DELETE_GROUP",
      group_id: perGroup._id,
    });
  }, [perGroup._id]);

  const createdByMessage = useMemo(() => {
    const owner =
      perGroup?.members?.find((m) => m?._id === perGroup?.createdBy) || {};
    if (!owner._id) return "";
    const time = formatCustomDate(perGroup.createdAT);

    return `Created by ${owner.username || owner.email} ${time}`;
  }, [perGroup]);

  return (
    <div className="group-edit-container">
      <div className="group-info-back">
        <IconButton onClick={() => navigate(`/groups/${perGroup._id}`)}>
          <ArrowBackIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />
        </IconButton>
      </div>
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
      <h4
        style={{ textAlign: "center", wordWrap: "break-word" }}
        className={isDarkTheme ? "l-t-svg" : "d-t-svg"}
      >
        {perGroup.description}
      </h4>
      <h5
        style={{ textAlign: "center", opacity: "50%" }}
        className={isDarkTheme ? "l-t-svg" : "d-t-svg"}
      >
        {createdByMessage}
      </h5>
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
          <GroupMembersAdd handleAddNewMembers={handleAddNewMembers} />
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

                <UserSettings
                  member={member}
                  user={user}
                  perGroup={perGroup}
                  isAdmin={isAdmin}
                  setperGroup={setperGroup}
                />
              </MenuItem>
            );
          })}
        </MenuList>
        {perGroup?.admins?.includes(user._id) && (
          <Button
            size="small"
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

const UserSettings = memo(
  ({ member, perGroup, isAdmin, setperGroup, user }) => {
    const { isDarkTheme } = useContext(ThemeTypeContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const isUSerSelfADmin = perGroup?.admins?.includes(user._id);
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
        updateGroup({
          type: "REMOVE_MEMBER",
          group_id: perGroup._id,
          member_id: member._id,
        });
        return { ...obj };
      });
    }, [member._id, perGroup._id, setperGroup]);

    const leaveGroup = useCallback(() => {
      setperGroup((prev) => {
        let obj = prev;
        obj.members = obj.members.filter((a) => a._id !== member._id);
        obj.admins = obj.admins.filter((a) => a !== member._id);
        updateGroup({
          type: "LEAVE_GROUP",
          group_id: perGroup._id,
          member_id: member._id,
        });
        return { ...obj };
      });
      emitter.emit("GROUP_LEFT_BY_USER", { group_id: perGroup._id });
    }, [member._id, perGroup._id, setperGroup]);

    console.log("member", { ...member, isAdmin });
    console.log("isUSerSelfADmin", isUSerSelfADmin);
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
          <SettingsIcon className={isDarkTheme ? "l-t-svg" : "d-t-svg"} />
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
          {isUSerSelfADmin && (
            <>
              {isAdmin ? (
                <>
                  {perGroup?.admins?.length > 1 && (
                    <MenuItem sx={{ gap: "10px" }} onClick={revokeAdmin}>
                      <RemoveCircleIcon /> Revoke Admin
                    </MenuItem>
                  )}
                </>
              ) : (
                <MenuItem onClick={makeAdmin} sx={{ gap: "10px" }}>
                  <AdminPanelSettingsIcon fontSize="small" />
                  Make Admin
                </MenuItem>
              )}
            </>
          )}

          {isUSerSelfADmin && member._id !== user._id && (
            <MenuItem sx={{ gap: "10px" }} onClick={removeFromGroup}>
              <DeleteForeverIcon /> Remove from group
            </MenuItem>
          )}
          {member._id === user._id && (
            <MenuItem sx={{ gap: "10px" }} onClick={leaveGroup}>
              <DeleteForeverIcon /> Leave Group
            </MenuItem>
          )}
          {member._id !== user._id && (
            <MenuItem sx={{ gap: "10px" }} onClick={() => {}} disabled>
              <MessageIcon /> Message {member.username || member.email}
            </MenuItem>
          )}
        </Menu>
      </motion.div>
    );
  }
);

GroupEdit.displayName = "GroupEdit";
UserSettings.displayName = "UserSettings";
export default GroupEdit;
