const multer = require('multer');

// Configure disk storage for Multer temporary uploads
const storage = multer.diskStorage({});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limit 5MB
});

module.exports = { upload };
