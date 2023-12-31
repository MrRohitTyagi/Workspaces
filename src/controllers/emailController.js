import { caller } from "../utils/helperFunctions";

export const deleteEmail = async (id, email) => {
  const { data } = await caller("delete", `email/delete/${id}/${email}`);
  return data;
};
export const deleteEmailSent = async (id) => {
  const { data } = await caller("delete", `email/delete-sent/${id}`);
  return data;
};
export const createEmail = async (payload) => {
  const { data } = await caller("post", `email/create`, payload);
  return data;
};
export const updateEmail = async (payload) => {
  const { data } = await caller("put", `email/update-email`, payload);
  return data;
};
export const getEmail = async (id) => {
  const { data } = await caller("get", `email/get-email/${id}`);
  return data;
};
