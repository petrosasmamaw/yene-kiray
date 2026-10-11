import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

async function testUpload() {
  const filePath = 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_houses_1791707315964.jpg';
  try {
    const fileBuffer = fs.readFileSync(filePath);
    console.log('File size:', fileBuffer.length);

    // Test with stream upload or basic upload
    const res = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'yene_kiray/categories' },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      stream.end(fileBuffer);
    });

    console.log('UPLOAD STREAM SUCCESS:', res.secure_url);
  } catch (err) {
    console.error('UPLOAD ERROR FULL:', err);
  }
  process.exit(0);
}

testUpload();
