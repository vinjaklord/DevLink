import ImageKit from 'imagekit';
import * as dotenv from 'dotenv';

dotenv.config();
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

async function uploadImage(fileBuffer, fileName) {
  return await imagekit.upload({
    file: fileBuffer,
    fileName,
  });
}

async function deleteFileInImageKit(fileId) {
  await imagekit.deleteFile(fileId);
}

export { imagekit, uploadImage, deleteFileInImageKit };
