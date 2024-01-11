import { memo } from "react";
import PropTypes from "prop-types";

import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Avatar, IconButton } from "@mui/material";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const InputFileUpload = memo(({ picture, setPicture, sx = {} }) => {
  return (
    <IconButton
      disableFocusRipple
      disableRipple
      disableTouchRipple
      component="label"
      variant="contained"
      size="small"
      color="success"
      fullWidth
    >
      {picture ? (
        <Avatar
          src={
            typeof picture === "string" ? picture : URL.createObjectURL(picture)
          }
          sx={sx}
        />
      ) : (
        <>
          <h6>Picture ‎ </h6>
          <CloudUploadIcon />
        </>
      )}
      <VisuallyHiddenInput
        type="file"
        onChange={(e) => {
          setPicture(e?.target?.files?.[0]);
        }}
      />
    </IconButton>
  );
});
InputFileUpload.displayName = "InputFileUpload";
InputFileUpload.propTypes = {
  picture: PropTypes.any,
  sx: PropTypes.object,
  setPicture: PropTypes.func,
};

export default InputFileUpload;
