import axios from "axios";
import { toast } from "react-toastify";

async function uploadImage(profiledata) {
  const pic = encodeImageFileAsURL(profiledata);
  let imageData = await axios.post(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDNERY_CLOUDNAME
    }/upload`,
    pic
  );
  return imageData.data.url;
}
function encodeImageFileAsURL(element) {
  var data = new FormData();
  data.append("file", element);
  data.append("upload_preset", import.meta.env.VITE_CLOUDNERY_PRESET);
  return data;
}
function encodeImageFileAsURLForMultiupload(element) {
  var data = new FormData();
  data.append("file", element);
  data.append("upload_preset", import.meta.env.VITE_CLOUDNERY_PRESET);
  return data;
}

async function multiupload(files) {
  if (files === "") return;
  if (files.length > 4) {
    toast.error("Cannot upload more than 4 images");
    return;
  }
  let imageArray = [];

  for (let i = 0; i < files.length; i++) {
    const image = files[i];
    let profileData = encodeImageFileAsURLForMultiupload(image);
    if (profileData) {
      let url = await uploadImage(profileData);
      imageArray.push(url);
    }
  }
  return imageArray;
}
export { multiupload, encodeImageFileAsURL, uploadImage };
