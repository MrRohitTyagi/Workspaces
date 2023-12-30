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

const varient = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

const PerEmailScreen = ({
  user,
  email,
  setOpenOneEmail,
  handleEmailDelete,
  handleArchiveEmail,
  handleStarEmail,
}) => {
  const { subject, _id, body, starredBy, archivedBy, isUnread, sender } =
    email || {};

  return (
    <>
      <div className="filters-comp">
        <motion.div initial="hidden" animate="visible" variants={varient}>
          <IconButton onClick={() => setOpenOneEmail({})}>
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
    </>
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
