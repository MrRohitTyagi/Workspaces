import { caller } from "../utils/helperFunctions";

export const confugureUser = async (name, email) => {
  const { data } = await caller("post", "user/configure", { name, email });
  return data;
};
