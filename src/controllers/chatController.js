import { caller } from "@/utils/helperFunctions";
import { encodeImageFileAsURL } from "@/utils/imageupload";
import axios from "axios";

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
export const deleteSingleMessage = async (payload) => {
  const { data } = await caller("put", `chat/delete-single-message`, payload);
  return data;
};
export const saveEditedMessageController = async (payload) => {
  const { data } = await caller("put", `chat/save-edited-message`, payload);
  return data;
};

export function sendImageMessage(msgObj, file) {
  const pic = encodeImageFileAsURL(file);
  axios
    .post(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDNERY_CLOUDNAME
      }/upload`,
      pic
    )
    .then(({ data }) => {
      console.log("data", data);
      const payload = {
        ...msgObj,
        message: { ...msgObj.message, image: data.url },
      };
      saveMessages(payload);
    });
}
