/* eslint-disable react/prop-types */
import Button from "@mui/material/Button";
import { motion } from "framer-motion";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { searchEmail } from "@/controllers/emailController";
import useAuth from "@/utils/useAuth";
import { Avatar, IconButton, MenuItem } from "@mui/material";
import AsyncSelect from "@/components/coreComponents/AsyncSelect";

import MapsUgcIcon from "@mui/icons-material/MapsUgc";
import { ThemeTypeContext } from "@/App";
import { useContext, useMemo, useCallback, useState, memo } from "react";

export default function GroupMembersAdd({ handleAddNewMembers }) {
  const { user } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const [newMembers, setNewMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    handleAddNewMembers(newMembers);
    setNewMembers([]);
    setOpen(false);
  };
  const fetchOptions = useCallback(async (searchValue) => {
    const { response = [] } = await searchEmail(searchValue);
    return response;
  }, []);
  const handleOnChange = useCallback((data) => {
    console.log(`%c data `, "color: orange;border:2px dotted oranfe", data);
    // setFormData((p) => ({ ...p, members: data }));
    setNewMembers(data);
  }, []);
  const filter = useMemo(() => {
    return { key: "_id", value: user._id };
  }, [user._id]);

  return (
    <>
      <MenuItem
        onClick={handleClickOpen}
        sx={{
          background: "transparent",
        }}
      >
        <motion.div
          className="per-chat-line"
          initial={{ scale: 0 }}
          style={{
            borderRadius: "5px",
            border: `1px solid ${isDarkTheme ? "lightgreen" : "darkgreen"}`,
          }}
          animate={{ scale: 1 }}
        >
          <div></div>
          <IconButton>
            <MapsUgcIcon
              fontSize="30px"
              className={isDarkTheme ? "l-t-svg" : "d-t-svg"}
            />
          </IconButton>
          Add Member(s)
        </motion.div>
      </MenuItem>
      <Dialog
        className="DIALOGUE_MEMBERA_ADD"
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{"Add Members"}</DialogTitle>
        <DialogContent>
          <div style={{ minWidth: "300px" }}>
            <AsyncSelect
              filterConfig={filter}
              fetchOptions={fetchOptions}
              handleOnChange={handleOnChange}
              label={"Add member"}
              CustomOption={CustomOption}
            />
          </div>
          <div className="new-added-members">
            {newMembers.map((m) => {
              return <CustomOption key={m._id} data={m} />;
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
const CustomOption = memo(({ data }) => {
  return (
    <div className="custom-async-dropdown-option-group">
      <Avatar src={data.picture} />
      <div className="fsfkfijge">
        <h4>{data.username || data.email}</h4>
        <h6 style={{ opacity: "40%" }}>{data.email}</h6>
      </div>
    </div>
  );
});
CustomOption.displayName = "CustomOption";
