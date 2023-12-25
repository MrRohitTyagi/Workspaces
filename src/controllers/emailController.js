import { caller } from "../utils/helperFunctions";

export const deleteEmail = async (id, email) => {
  const { data } = await caller("delete", `email/delete/${id}/${email}`);
  return data;
};
export const createEmail = async (payload) => {
  const { data } = await caller("post", `email/create`, payload);
  return data;
};
