import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'udiar6as',
  api_key: process.env.CLOUDINARY_API_KEY || '781452294229436',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'P7g5qayGps7MUTN79SA1Jwci4Ak',
  secure: true
});

export default cloudinary;

