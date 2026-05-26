const { cloudinary } = require('../config/cloudinary');

const uploadController = {
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
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
      console.error('File upload failed:', err.message);
      res.status(500).json({ message: 'File upload failed: ' + err.message });
    }
  }
};

module.exports = uploadController;
