import cloudinary from '../config/cloudinary.js';

async function testSimple() {
  const filePath = 'C:\\Users\\For you\\.gemini\\antigravity-ide\\brain\\095e6a4b-e87f-49ec-87e7-f6f1d9bfbe05\\cat_houses_1791707315964.jpg';
  try {
    const res = await cloudinary.uploader.upload(filePath);
    console.log('SIMPLE UPLOAD SUCCESS:', res.secure_url);
  } catch (err) {
    console.error('SIMPLE UPLOAD ERROR:', err);
  }
  process.exit(0);
}

testSimple();
