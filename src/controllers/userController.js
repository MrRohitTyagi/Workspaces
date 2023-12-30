import { caller } from "../utils/helperFunctions";

export const confugureUser = async (userData, filterKey) => {
  const headers = { filterKey };
  const { data } = await caller("post", "user/configure", userData, headers);
  return data;
};
