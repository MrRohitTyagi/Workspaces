import { motion } from "framer-motion";
import { startCase } from "lodash";

import { Avatar, Button, IconButton, Skeleton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ArchiveIcon from "@mui/icons-material/Archive";
import StarIcon from "@mui/icons-material/Star";

import { capitalizeFirstLetter } from "../../utils/helperFunctions";
import Loader from "../Loader";
import "./singleEmail.css";

import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  deleteEmail,
  getEmail,
  updateEmail,
} from "../../controllers/emailController";
import { toast } from "react-toastify";
import useAuth from "../../utils/useAuth";
import { getUser } from "../../controllers/userController";
import ReplyIcon from "@mui/icons-material/Reply";
import { emitter } from "../../utils/eventemitter";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
const varient = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

const PerEmailScreen = () => {
  const [email, setEmail] = useState({});
  const [avatarImage, setAvatarImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { id } = useParams();

  const { subject, _id, body, starredBy, archivedBy, sender } = email || {};

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
    if (!email._id) return;

    (async function () {
      const { response } = await getUser({
        type: "GET-BY-EMAIL",
        email: email.sender,
      });

      setAvatarImage(response.picture);
    })();
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
              <ArrowBackIcon />
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
                <StarBorderIcon />
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
                <ArchiveIcon />
              </Tooltip>
            </IconButton>
          )}
        </motion.div>
      </div>
      <div className="single-emailcontainer">
        <h3>{capitalizeFirstLetter(subject)}</h3>

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
            <div className="single-email-body">
              <BodyRenderer str={body} />
              <div className="fordard-reply-box">
                <Button
                size="small"
                  onClick={() => emitter.emit("ADD_NEW_EMAIL", { to: sender })}
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
};

const BodyRenderer = ({ str }) => {
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
};

export default PerEmailScreen;
