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
  if (files.length > 4) {
    toast.error("Cannot upload more than 4 images");
    return;
  }

  const alreadyUrls = [];
  const uploadPromises = files.map(async (image) => {
    if (typeof image === "string") {
      alreadyUrls.push(image);
      return null;
    }
    const imageData = encodeImageFileAsURLForMultiupload(image);
    if (imageData) {
      return uploadImageforMultiselect(imageData);
    }
    return null;
  });

  const uploadedImages = await Promise.all(uploadPromises);

  const res = uploadedImages.filter((url) => url !== null);
  return [...res, ...alreadyUrls];
}

async function uploadImageforMultiselect(Imgdata) {
  let imageData = await axios.post(
    `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDNERY_CLOUDNAME
    }/upload`,
    Imgdata
  );
  return imageData.data.url;
}
export { multiupload, encodeImageFileAsURL, uploadImage };
