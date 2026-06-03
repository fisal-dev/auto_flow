const Vehicle = require('../models/Vehicle');
const { supabase } = require('../config/supabase');
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
      let docUrl = '';
      let docSize = '';

      if (supabase) {
        try {
          const fileBuffer = fs.readFileSync(req.file.path);
          const extension = path.extname(originalName) || '';
          const baseName = path.basename(originalName, extension);
          const fileName = `${baseName}-${Date.now()}${extension}`;

          // Upload file to Supabase bucket 'documents'
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, fileBuffer, {
              contentType: req.file.mimetype,
              upsert: true
            });

          if (uploadError) {
            throw new Error(
              `${uploadError.message}. Make sure you have created a public bucket named 'documents' in your Supabase Storage dashboard.`
            );
          }

          // Retrieve the public URL
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(fileName);

          docUrl = urlData.publicUrl;
          docSize = formatBytes(req.file.size);
        } catch (storageErr) {
          console.error('Supabase upload failed:', storageErr.message);
          return res.status(500).json({ 
            message: 'Supabase storage error: ' + storageErr.message 
          });
        }
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

      const doc = vehicle.documents.find(d => d._id.toString() === docId);
      
      // If the file was stored on Supabase, delete it from Supabase storage as well
      if (doc && supabase && doc.url.includes('supabase.co')) {
        const parts = doc.url.split('/public/documents/');
        if (parts.length > 1) {
          const filePath = parts[1];
          await supabase.storage.from('documents').remove([filePath]);
        }
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
