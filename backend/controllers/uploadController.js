const { supabase } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

const uploadController = {
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!supabase) {
        throw new Error('Supabase client is not configured.');
      }

      const fileBuffer = fs.readFileSync(req.file.path);
      const originalName = req.file.originalname;
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

      res.status(200).json({
        url: urlData.publicUrl,
        publicId: fileName
      });
    } catch (err) {
      console.error('Supabase upload failed:', err.message);
      res.status(500).json({ 
        message: 'Supabase storage error: ' + err.message 
      });
    }
  }
};

module.exports = uploadController;
