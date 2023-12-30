import { IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./singleEmail.css";
import { capitalizeFirstLetter } from "../../utils/helperFunctions";

const PerEmailScreen = ({ email, setOpenOneEmail }) => {
  console.log(`%c email `, "color: yellow;border:1px solid lightgreen", email);
  return (
    <>
      <div className="filters-comp">
        <IconButton onClick={() => setOpenOneEmail({})}>
          <Tooltip title="Refresh">
            <ArrowBackIcon />
          </Tooltip>
        </IconButton>
      </div>
      <div className="single-emailcontainer">
        <h3>{capitalizeFirstLetter(email.subject)}</h3>
      </div>
    </>
  );
};

export default PerEmailScreen;
