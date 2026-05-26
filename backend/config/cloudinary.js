const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || 'autoflow_cloud',
  api_key: process.env.CLOUD_API_KEY || '123456789',
  api_secret: process.env.CLOUD_API_SECRET || 'abcdefgh'
});

// Configure disk storage for Multer temporary uploads
const storage = multer.diskStorage({});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limit 5MB
});

module.exports = { cloudinary, upload };
