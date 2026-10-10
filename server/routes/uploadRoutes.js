import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Helper: Save file buffer locally as guaranteed fallback
const saveLocally = (file, req) => {
  const ext = path.extname(file.originalname) || '.jpg';
  const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${cleanExt}`;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, file.buffer);

  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/uploads/${filename}`;

  return {
    image_url: imageUrl,
    public_id: filename,
    storage: 'server-local'
  };
};

// @desc    Upload an image buffer to Cloudinary with local storage fallback
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const folder = req.body.folder || 'yene_kiray/listings';

    // Attempt Cloudinary upload stream with a 6-second timeout
    const cloudinaryPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Cloudinary upload timed out'));
      }, 6000);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto'
        },
        (error, result) => {
          clearTimeout(timer);
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    try {
      const cloudResult = await cloudinaryPromise;
      return res.json({
        success: true,
        image_url: cloudResult.secure_url,
        public_id: cloudResult.public_id,
        width: cloudResult.width,
        height: cloudResult.height,
        format: cloudResult.format,
        storage: 'cloudinary'
      });
    } catch (cloudErr) {
      console.warn('⚠️ Cloudinary upload failed or restricted (falling back to server storage):', cloudErr.message || cloudErr);
      // Seamlessly fall back to server local storage so user post is never blocked!
      const localResult = saveLocally(req.file, req);
      return res.json({
        success: true,
        image_url: localResult.image_url,
        public_id: localResult.public_id,
        storage: localResult.storage,
        fallback: true
      });
    }
  } catch (err) {
    console.error('Upload route error:', err);
    // Last-ditch fallback if req.file exists
    if (req.file) {
      try {
        const localResult = saveLocally(req.file, req);
        return res.json({
          success: true,
          image_url: localResult.image_url,
          public_id: localResult.public_id,
          storage: 'server-local',
          fallback: true
        });
      } catch (saveErr) {
        console.error('Local fallback failed:', saveErr);
      }
    }
    return res.status(500).json({ success: false, message: err.message || 'Image processing failed' });
  }
});

export default router;

