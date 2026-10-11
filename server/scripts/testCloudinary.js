import cloudinary from '../config/cloudinary.js';

async function testCloudinary() {
  try {
    const res = await cloudinary.api.ping();
    console.log('PING SUCCESS:', res);
  } catch (err) {
    console.error('PING ERROR:', err);
  }
  process.exit(0);
}

testCloudinary();
