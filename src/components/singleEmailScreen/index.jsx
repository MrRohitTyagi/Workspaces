import { motion } from "framer-motion";

import { IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ArchiveIcon from "@mui/icons-material/Archive";
import StarIcon from "@mui/icons-material/Star";

import { capitalizeFirstLetter } from "../../utils/helperFunctions";
import "./singleEmail.css";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  deleteEmail,
  getEmail,
  updateEmail,
} from "../../controllers/emailController";
import { toast } from "react-toastify";

const varient = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

const PerEmailScreen = () => {
  const [email, setEmail] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth0();
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

  if (isLoading) return <div className="single-emailcontainer">Loading...</div>;

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
            <AccountCircleIcon />
          </div>
          <div className="single-email-from-cont">
            <h5>{sender}</h5>
            <div className="single-email-body">
              <BodyRenderer str={body} />
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
