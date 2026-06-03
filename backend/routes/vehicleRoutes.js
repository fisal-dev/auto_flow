const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const vehicleController = require('../controllers/vehicleController');

const vehicleRoutes = express.Router();
const { upload } = require('../config/cloudinary');
const documentController = require('../controllers/documentController');

vehicleRoutes.get('/', authMiddleware, vehicleController.getVehicles);
vehicleRoutes.get('/search', authMiddleware, vehicleController.searchVehicle);
vehicleRoutes.post('/quick-register', authMiddleware, vehicleController.quickRegister);
vehicleRoutes.post('/', authMiddleware, vehicleController.createVehicle);
vehicleRoutes.get('/:id', authMiddleware, vehicleController.getVehicleById);
vehicleRoutes.put('/:id', authMiddleware, vehicleController.updateVehicle);
vehicleRoutes.delete('/:id', authMiddleware, vehicleController.deleteVehicle);

// Document upload & delete routes for a vehicle
vehicleRoutes.post('/:id/documents', authMiddleware, upload.single('file'), documentController.uploadDocument);
vehicleRoutes.delete('/:id/documents/:docId', authMiddleware, documentController.deleteDocument);

module.exports = vehicleRoutes;
