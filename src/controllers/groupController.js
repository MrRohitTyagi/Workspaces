import { encodeImageFileAsURL } from "@/utils/imageupload";
import { caller } from "../utils/helperFunctions";
import axios from "axios";

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
export const deleteGroup = async (id) => {
  const { data } = await caller("delete", `group/delete/${id}`);
  return data;
};
export const updateGroup = async (payload) => {
  const { data } = await caller("put", "group/update", payload);
  return data;
};
export const deleteOneGroupMessage = async (payload) => {
  const { data } = await caller(
    "put",
    "group/delete-singel-message",
    payload
  );
  return data;
};

export function sendImageMessageGroup(msgObj, file) {
  const pic = encodeImageFileAsURL(file);
  axios
    .post(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDNERY_CLOUDNAME
      }/upload`,
      pic
    )
    .then(({ data }) => {
      const payload = {
        ...msgObj,
        message: { ...msgObj.message, image: data.url },
      };
      saveGroupMessage(payload);
    });
}
