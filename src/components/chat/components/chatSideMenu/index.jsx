import AddReactionIcon from "@mui/icons-material/AddReaction";

import "./chatSideMenuStyles.css";

import { Avatar, MenuItem, MenuList } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { ThemeTypeContext } from "@/App";
import { useContext } from "react";

const ChatSideMenu = ({ allChats }) => {
  const { user } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const navigate = useNavigate();
  console.log(
    `%c allChats `,
    "color: orange;border:2px dotted oranfe",
    allChats
  );
  return (
    <div className="chat-side-menu-container">
      <div className="add-new-chat-button-cont">
        <div
          className={
            "add-new-chat-button" + (isDarkTheme ? " add-chat-dark" : "")
          }
        >
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
            const userToshow = to._id === user._id ? from : to;
            return (
              <MenuItem
                key={_id}
                className="fdsafda"
                onClick={() => {
                  navigate(`/chats/${_id}`);
                }}
              >
                <div className="per-chat-line">
                  <Avatar
                    src={userToshow.picture}
                    sx={{ height: "35px", width: "35px" }}
                  />
                  <h5>
                    {userToshow.username ||
                      `${userToshow.email.slice(0, 15)}...`}
                  </h5>
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
