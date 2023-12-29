import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import { listenToEvent, emitter } from "../../utils/eventemitter";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function CustomizedSnackbars() {
  const [toast, setToast] = React.useState({
    isOpen: false,
    type: null,
    message: "",
  });

  React.useEffect(() => {
    const handleShowToast = ({ message, type }) => {
      console.log("{ message, type }", { message, type });
      setToast({ message, type, isOpen: true });
    };

    listenToEvent("TOGGLE_TOAST", handleShowToast);

    return () => {
      emitter.off("TOGGLE_TOAST", handleShowToast);
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToast({ isOpen: false, type: null, message: "" });
  };

  console.log(
    `%c toast `,
    "color: white;border:3px solid white;margin:5px",
    toast
  );
  return (
    <Snackbar open={toast.isOpen} autoHideDuration={3000} onClose={handleClose}>
      <Alert
        onClose={handleClose}
        severity={toast.type || ""}
        sx={{ width: "100%" }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  );
}
// error
// warning
// info
// success
