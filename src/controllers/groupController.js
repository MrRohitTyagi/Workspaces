import { caller } from "../utils/helperFunctions";

export const createGroup = async (groupData) => {
  const { data } = await caller("post", "group/create", groupData);
  return data;
};
export const getOneGroup = async (id) => {
  const { data } = await caller("get", `group/get-one-group/${id}`);
  return data;
};
export const getAllGroupsOfUser = async (id) => {
  const { data } = await caller("get", `group/get-all-user-groups/${id}`);
  return data;
};
export const saveGroupMessage = async (payload) => {
  const { data } = await caller("put", "group/save-group-message", payload);
  return data;
};
