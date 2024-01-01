import { caller } from "../utils/helperFunctions";

export const confugureUser = async (userData, filterKey) => {
  const headers = { filterKey };
  const { data } = await caller("post", "user/configure", userData, headers);
  return data;
};
export const getUser = async (userData) => {
  const { data } = await caller("post", `user/get`, userData);
  return data;
};
export const createUser = async (userData) => {
  const { data } = await caller("post", "user/create", userData);
  return data;
};
