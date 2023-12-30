import { IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const PerEmailScreen = ({ email, setOpenOneEmail }) => {
  console.log(`%c email `, "color: yellow;border:1px solid lightgreen", email);
  return (
    <div className="filters-comp">
      <IconButton onClick={() => setOpenOneEmail({})}>
        <Tooltip title="Refresh">
          <ArrowBackIcon />
        </Tooltip>
      </IconButton>
    </div>
  );
};

export default PerEmailScreen;
