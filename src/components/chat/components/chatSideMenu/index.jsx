import AddReactionIcon from "@mui/icons-material/AddReaction";

import "./chatSideMenuStyles.css";

import { Avatar, MenuItem, MenuList } from "@mui/material";
import { useNavigate } from "react-router-dom";

const ChatSideMenu = ({ allChats }) => {
  const navigate = useNavigate();

  return (
    <div className="chat-side-menu-container">
      <div className="add-new-chat-button-cont">
        <div className="add-new-chat-button">
          <AddReactionIcon color="success" />
          <h3>New Chat</h3>
        </div>
        <MenuList
          id="basic-menu"
          open={open}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          {allChats.map(({ _id, to, from }) => {
            return (
              <MenuItem
                key={_id}
                className="fdsafda"
                onClick={() => navigate(`/chats/${_id}`)}
              >
                <div className="per-chat-line">
                  <Avatar
                    src={to.picture}
                    sx={{ height: "35px", width: "35px" }}
                  />
                  <h5>{to.username || `${to.email.slice(0, 15)}...`}</h5>
                </div>
              </MenuItem>
            );
          })}
        </MenuList>
      </div>
    </div>
  );
};

export default ChatSideMenu;
