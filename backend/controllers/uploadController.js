const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadController = {
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Check if Cloudinary credentials are mock/default. If so, go straight to fallback.
      const isCloudinaryConfigured = 
        process.env.CLOUD_NAME && 
        process.env.CLOUD_NAME !== 'autoflow_cloud' &&
        process.env.CLOUD_API_KEY &&
        process.env.CLOUD_API_KEY !== '123456789';

      if (!isCloudinaryConfigured) {
        throw new Error('Cloudinary not configured, using local storage fallback');
      }

      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'autoflow_attachments',
        resource_type: 'auto'
      });

      res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id
      });
    } catch (err) {
      console.warn('Cloudinary upload failed or not configured, using local fallback:', err.message);
      
      try {
        // Ensure local uploads directory exists
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate local filename
        const extension = path.extname(req.file.originalname) || '.jpg';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        const destPath = path.join(uploadsDir, filename);

        // Copy file from temp path to destPath
        fs.copyFileSync(req.file.path, destPath);

        // Get server base URL
        const protocol = req.protocol;
        const host = req.get('host'); // e.g. localhost:3000
        const localUrl = `${protocol}://${host}/uploads/${filename}`;

        res.status(200).json({
          url: localUrl,
          publicId: filename
        });
      } catch (localErr) {
        console.error('Local fallback upload failed:', localErr.message);
        res.status(500).json({ message: 'File upload failed: ' + localErr.message });
      }
    }
  }
};

module.exports = uploadController;
