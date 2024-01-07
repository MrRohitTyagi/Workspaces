import { caller } from "@/utils/helperFunctions";

export const getAllChatsPerUser = async (id) => {
  const { data } = await caller("get", `chat/get-all-chats/${id}`);
  return data;
};
export const getUserChat = async (id) => {
  const { data } = await caller("get", `chat/get-user-chat/${id}`);
  return data;
};
export const saveMessages = async (payload) => {
  const { data } = await caller("post", `chat/save-message`, payload);
  return data;
};
export const newChat = async (payload) => {
  const { data } = await caller("post", `chat/create`, payload);
  return data;
};
