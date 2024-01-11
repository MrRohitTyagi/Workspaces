/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { memo, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Avatar, Button, IconButton, Skeleton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ArchiveIcon from "@mui/icons-material/Archive";
import StarIcon from "@mui/icons-material/Star";
import ReplyIcon from "@mui/icons-material/Reply";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

import Loader from "@/components/Loader";

import "./singleEmail.css";

import {
  deleteEmail,
  getEmail,
  updateEmail,
} from "@/controllers/emailController";
import { getUser } from "@/controllers/userController";

import { capitalizeFirstLetter } from "@/utils/helperFunctions";
import useAuth from "@/utils/useAuth";
import { emitter } from "@/utils/eventemitter";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { ThemeTypeContext } from "@/App";

const varient = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};
let done = false;

const PerEmailScreen = memo(() => {
  const { isDarkTheme } = useContext(ThemeTypeContext);

  const [email, setEmail] = useState({});
  const [avatarImage, setAvatarImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { id } = useParams();

  const { subject, _id, body, starredBy, archivedBy, sender, attachments } =
    email || {};

  const handleArchiveEmail = useCallback(
    async (email, isArchived) => {
      let archivedBy = email.archivedBy || [];

      if (isArchived) {
        archivedBy = archivedBy.filter((s) => s !== user.email);
      } else {
        archivedBy.push(user.email);
      }
      setEmail((prev) => ({ ...prev, archivedBy }));
      await updateEmail({ ...email, archivedBy, updateingKey: "archivedBy" });
      toast.success(isArchived ? "Email UnArchived!" : "Email Archived!");
    },
    [user]
  );

  const handleStarEmail = useCallback(
    async (email, isStarred) => {
      let starredBy = email.starredBy || [];
      if (isStarred) {
        starredBy = starredBy.filter((s) => s !== user.email);
      } else {
        starredBy.push(user.email);
      }
      setEmail((prev) => ({ ...prev, starredBy }));
      await updateEmail({ ...email, starredBy, updateingKey: "starredBy" });
      toast.success(isStarred ? "Email Unstarred!" : "Email Starred!");
    },
    [user]
  );

  const handleEmailDelete = useCallback(
    async (_id) => {
      await deleteEmail(_id, user.email);
      toast.success("Email Deleted!");
      window.history.back();
    },
    [user]
  );

  useEffect(() => {
    (async function fetchEmaill() {
      setIsLoading(true);
      const { response } = await getEmail(id);
      setEmail(response);
      setIsLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!email._id || done) return;

    (async function () {
      const { response } = await getUser({
        type: "GET-BY-EMAIL",
        email: email.sender,
      });
      done = true;
      setAvatarImage(response.picture);
    })();
    return () => {
      done = false;
    };
  }, [email]);

  if (isLoading)
    return (
      <div className="single-emailcontainer">
        <Loader />
      </div>
    );

  return (
    <div className="single-email-container">
      <div className="filters-comp">
        <motion.div initial="hidden" animate="visible" variants={varient}>
          <IconButton onClick={() => window.history.back()}>
            <Tooltip title="Refresh">
              <ArrowBackIcon
                className={`${isDarkTheme ? "l-t-svg" : "d-t-svg"}`}
              />
            </Tooltip>
          </IconButton>
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={varient}>
          <IconButton onClick={() => handleEmailDelete(_id)}>
            <Tooltip title="Delete">
              <DeleteForeverIcon color="error" />
            </Tooltip>
          </IconButton>
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={varient}>
          {starredBy.includes(user.email) ? (
            <IconButton onClick={() => handleStarEmail(email, true)}>
              <Tooltip title="Mark As Unmportant">
                <StarIcon color="warning" />
              </Tooltip>
            </IconButton>
          ) : (
            <IconButton onClick={() => handleStarEmail(email, false)}>
              <Tooltip title="Mark As Important">
                <StarBorderIcon
                  className={`${isDarkTheme ? "l-t-svg" : "d-t-svg"}`}
                />
              </Tooltip>
            </IconButton>
          )}
        </motion.div>
        {/* //////////////////////// */}
        <motion.div initial="hidden" animate="visible" variants={varient}>
          {archivedBy.includes(user.email) ? (
            <IconButton onClick={() => handleArchiveEmail(email, true)}>
              <Tooltip title="Unarchive">
                <ArchiveIcon color="warning" />
              </Tooltip>
            </IconButton>
          ) : (
            <IconButton onClick={() => handleArchiveEmail(email, false)}>
              <Tooltip title="Archive">
                <ArchiveIcon
                  className={`${isDarkTheme ? "l-t-svg" : "d-t-svg"}`}
                />
              </Tooltip>
            </IconButton>
          )}
        </motion.div>
      </div>
      <div className="single-emailcontainer">
        <h3 style={{ marginLeft: "10px" }}>{capitalizeFirstLetter(subject)}</h3>

        <div className="fdhjsbfdsafd">
          <div className="account-icon">
            {avatarImage ? (
              <Avatar src={avatarImage} alt={<AccountCircleIcon />} />
            ) : (
              <Skeleton
                animation="wave"
                variant="circular"
                width={40}
                height={40}
              />
            )}
          </div>
          <div className="single-email-from-cont">
            <h5> {capitalizeFirstLetter(sender)}</h5>
            <div
              className={`single-email-body ${
                isDarkTheme ? "l-t-svg" : "d-t-svg"
              }`}
            >
              <BodyRenderer str={body} />
              <StandardImageList attachments={email.attachments} />
              <div className="fordard-reply-box">
                <Button
                  size="small"
                  onClick={() =>
                    emitter.emit("ADD_NEW_EMAIL", {
                      to: [{ label: sender, value: sender }],
                    })
                  }
                  sx={{ alignSelf: "start" }}
                  variant="outlined"
                  startIcon={<ReplyIcon />}
                >
                  Reply
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    emitter.emit("ADD_NEW_EMAIL", {
                      attachments: attachments,
                      body: body,
                      subject: subject,
                    })
                  }
                  sx={{ alignSelf: "start" }}
                  variant="outlined"
                  startIcon={<ArrowOutwardIcon />}
                >
                  Forward
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const BodyRenderer = memo(({ str }) => {
  const stringWithBreaks = str.split("\n");
  return (
    <>
      {stringWithBreaks.map((l) => {
        return (
          <>
            {l} <br />
          </>
        );
      })}
    </>
  );
});

const StandardImageList = memo(({ attachments = [] }) => {
  return (
    <div
      className="attachments-cont"
      style={{ minHeight: attachments.length > 0 ? "70px" : "0px" }}
    >
      {attachments.map((item, i) => (
        <ResponsiveDialog key={i + "fgvhjdgfu"} imageUrl={item}>
          <img
            key={i + "fgvhjsdgfu"}
            className="single-email-image-upload-per-email"
            height={"70px"}
            width={"70px"}
            src={item}
            alt={"img"}
            loading="lazy"
          />
        </ResponsiveDialog>
      ))}
    </div>
  );
});

const ResponsiveDialog = memo(({ children, imageUrl }) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleDownload = async () => {
    try {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);

      // Create an anchor element
      const downloadLink = document.createElement("a");

      // Set the download link's href to the blob URL
      downloadLink.href = blobUrl;
      const ext = imageUrl.split(".").at(-1);
      // Set the download attribute with a desired filename
      downloadLink.download = `downloaded_image.${ext}`;

      // Append the download link to the body
      document.body.appendChild(downloadLink);

      // Programmatically click the download link
      downloadLink.click();

      // Remove the download link from the body
      document.body.removeChild(downloadLink);

      // Revoke the blob URL to free up resources
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <>
      <Button
        className="all-unset"
        variant="outlined"
        onClick={handleClickOpen}
      >
        {children}
      </Button>
      <Dialog
        className="fullScreen-dialogue-container"
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <img
            src={imageUrl}
            alt="image"
            height={"100%"}
            width={"100%"}
            style={{ objectFit: "contain" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownload} autoFocus variant="outlined">
            <CloudDownloadIcon color="primary" />
          </Button>
          <Button onClick={handleClose} autoFocus variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

PerEmailScreen.displayName = "PerEmailScreen";
BodyRenderer.displayName = "BodyRenderer";
ResponsiveDialog.displayName = "ResponsiveDialog";
StandardImageList.displayName = "StandardImageList";
export default PerEmailScreen;
