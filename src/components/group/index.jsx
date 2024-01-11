import { memo, useCallback, useContext, useEffect, useState } from "react";

import { ThemeTypeContext } from "@/App";
import "./groupStyles.css";
import GroupSideMenu from "./components/groupSideMenu";
import GroupWindow from "./components/groupWindow";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import GroupNotSelected from "./components/groupNotrSelected";
import useAuth from "@/utils/useAuth";

import { emitter, listenToEvent } from "@/utils/eventemitter";
import useWindowDimens from "@/utils/useWindowDimens";
import { createGroup, getAllGroupsOfUser } from "@/controllers/groupController";
import { uploadImage } from "@/utils/imageupload";
import { socket } from "../authorizeUser";
import GroupEdit from "./components/GroupEdit";
import { toast } from "react-toastify";

let groups;

const GroupIndex = memo(() => {
  const [allGroups, setAllGroups] = useState([]);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { user } = useAuth();
  const { isDarkTheme } = useContext(ThemeTypeContext);
  const innerWidth = useWindowDimens();

  const fetchAllGroups = useCallback(async () => {
    // const { response } = await getAllChatsPerUser(user._id);
    const { response } = await getAllGroupsOfUser(user._id);

    setAllGroups(response || []);
    return response;
  }, [user]);

  useEffect(() => {
    (async function () {
      groups = await fetchAllGroups();
      for (const grp of groups) {
        socket.emit("JOIN_ROOM", grp._id);
      }
    })();
    return () => {
      for (const grp of groups) {
        socket.emit("LEAVE_ROOM", grp._id);
      }
      groups = null;
    };
  }, [fetchAllGroups]);

  const addNewGroup = useCallback(
    async (group) => {
      let imageUrl = "";
      if (group.picture) {
        imageUrl = await uploadImage(group.picture);
      }
      const payload = {
        ...group,
        members: group.members.map((m) => m._id),
        picture: imageUrl,
      };
      const { response } = await createGroup(payload);
      setAllGroups((p) => [...p, response]);
      navigate(`/groups/${response._id}`);

      // emitter.emit("CLOSE_ADD_NEW_CHAT_POPUP");
      toast.info("New group added");
    },
    [navigate]
  );

  useEffect(() => {
    listenToEvent("U_GOT_ADDED_IN_A_GROUP", (data) => {
      toast.info("New group added");
      setAllGroups((p) => [...p, data]);
    });
    listenToEvent("ADD_NEW_GROUP", addNewGroup);

    listenToEvent("GROUP_DELETED_BY_ADMIN", ({ group_id }) => {
      setAllGroups((p) => p.filter((g) => g._id !== group_id));
      navigate("/groups/select");
      toast.info("Group deleted by admin");
    });
    listenToEvent("GROUP_LEFT_BY_USER", ({ group_id }) => {
      setAllGroups((p) => p.filter((g) => g._id !== group_id));
      navigate("/groups/select");
    });

    return () => {
      emitter.off("U_GOT_ADDED_IN_A_GROUP", () => {});
      emitter.off("DELETE_GROUP", () => {});
      emitter.off("GROUP_DELETED_BY_ADMIN", () => {});
      emitter.off("ADD_NEW_GROUP", addNewGroup);
    };
  }, [addNewGroup]);

  return (
    <div
      className={`chat-main-container ${isDarkTheme ? "chat-cont-dark" : ""}`}
    >
      {innerWidth > 750 && (
        <GroupSideMenu allGroups={allGroups} setAllGroups={setAllGroups} />
      )}
      <Routes>
        <Route
          path="/select"
          element={
            innerWidth > 750 ? (
              <GroupNotSelected />
            ) : (
              <GroupSideMenu
                allGroups={allGroups}
                setAllGroups={setAllGroups}
              />
            )
          }
        />
        <Route
          path="/edit/:id"
          element={<GroupEdit key={pathname} allGroups={allGroups} />}
        />
        <Route path="/:id" element={<GroupWindow key={pathname} />} />
      </Routes>
    </div>
  );
});

GroupIndex.displayName = "GropuIndex";

export default GroupIndex;
