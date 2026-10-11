import cloudinary from '../config/cloudinary.js';

async function checkUsage() {
  try {
    const res = await cloudinary.api.usage();
    console.log('USAGE:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('USAGE ERROR:', err);
  }
  process.exit(0);
}

checkUsage();
