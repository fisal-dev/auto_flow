const Vehicle = require('../models/Vehicle');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const formatBytes = (bytes, decimals = 1) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const documentController = {
  uploadDocument: async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const originalName = req.file.originalname;
      const isCloudinaryConfigured = 
        process.env.CLOUD_NAME && 
        process.env.CLOUD_NAME !== 'autoflow_cloud' &&
        process.env.CLOUD_API_KEY &&
        process.env.CLOUD_API_KEY !== '123456789';

      let docUrl = '';
      let docSize = '';

      if (isCloudinaryConfigured) {
        // Upload to Cloudinary
        const isImage = req.file.mimetype ? req.file.mimetype.startsWith('image/') : false;
        const resourceType = isImage ? 'image' : 'raw';
        const extension = path.extname(originalName) || '';
        const baseName = path.basename(originalName, extension);
        
        const uploadOptions = {
          folder: 'autoflow_documents',
          resource_type: resourceType
        };

        if (resourceType === 'raw') {
          // Raw files in Cloudinary need the extension in the public_id to preserve format
          uploadOptions.public_id = `${baseName}-${Date.now()}${extension}`;
        }

        const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);
        docUrl = result.secure_url;
        docSize = formatBytes(result.bytes || req.file.size);
      } else {
        // Fallback to local storage
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const extension = path.extname(originalName) || '.pdf';
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        const destPath = path.join(uploadsDir, filename);

        fs.copyFileSync(req.file.path, destPath);

        const protocol = req.protocol;
        const host = req.get('host');
        docUrl = `${protocol}://${host}/uploads/${filename}`;
        
        // Get file size from disk if not present in multer
        const stats = fs.statSync(destPath);
        docSize = formatBytes(stats.size);
      }

      // Add document metadata to vehicle
      vehicle.documents.push({
        name: originalName,
        url: docUrl,
        size: docSize
      });

      await vehicle.save();
      res.status(200).json(vehicle);
    } catch (err) {
      console.error('Error uploading document:', err);
      res.status(500).json({ message: 'Failed to upload document: ' + err.message });
    }
  },

  deleteDocument: async (req, res) => {
    try {
      const { id, docId } = req.params;
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Remove document from the list
      vehicle.documents = vehicle.documents.filter(doc => doc._id.toString() !== docId);
      await vehicle.save();

      res.status(200).json(vehicle);
    } catch (err) {
      console.error('Error deleting document:', err);
      res.status(500).json({ message: 'Failed to delete document: ' + err.message });
    }
  }
};

module.exports = documentController;
