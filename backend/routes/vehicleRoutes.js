const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const vehicleController = require('../controllers/vehicleController');

const vehicleRoutes = express.Router();

vehicleRoutes.get('/', authMiddleware, vehicleController.getVehicles);
vehicleRoutes.get('/search', authMiddleware, vehicleController.searchVehicle);
vehicleRoutes.post('/quick-register', authMiddleware, vehicleController.quickRegister);
vehicleRoutes.post('/', authMiddleware, vehicleController.createVehicle);
vehicleRoutes.get('/:id', authMiddleware, vehicleController.getVehicleById);
vehicleRoutes.put('/:id', authMiddleware, vehicleController.updateVehicle);
vehicleRoutes.delete('/:id', authMiddleware, vehicleController.deleteVehicle);

module.exports = vehicleRoutes;
