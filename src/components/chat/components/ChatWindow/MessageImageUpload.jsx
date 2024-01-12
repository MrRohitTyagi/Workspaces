import { memo, useCallback } from "react";
import PropTypes from "prop-types";

import { styled } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import PermMediaIcon from "@mui/icons-material/PermMedia";
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

const MessageImageUpload = memo(({ callback }) => {
  const handleUpload = useCallback(
    (e) => {
      callback(e?.target?.files?.[0]);
    },
    [callback]
  );
  return (
    <IconButton
      disableFocusRipple
      disableRipple
      disableTouchRipple
      component="label"
      variant="contained"
      size="small"
      fullWidth
    >
      <>
        <PermMediaIcon />
      </>

      <VisuallyHiddenInput type="file" onChange={handleUpload} />
    </IconButton>
  );
});
MessageImageUpload.displayName = "MessageImageUpload";
MessageImageUpload.propTypes = {
  callback: PropTypes.func,
};

export default MessageImageUpload;
