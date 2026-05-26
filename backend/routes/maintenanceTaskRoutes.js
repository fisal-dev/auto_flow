const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const maintenanceController = require('../controllers/maintenanceController');
const upcomingController = require('../controllers/upcomingController');

const maintenanceTaskRoutes = express.Router();

maintenanceTaskRoutes.get('/', authMiddleware, maintenanceController.getMaintenanceRecords); // Note: we can use getMaintenanceRecords as defined in controller
maintenanceTaskRoutes.post('/', authMiddleware, maintenanceController.createMaintenanceRecord);

// Task Status updates & upcoming services
maintenanceTaskRoutes.get('/upcoming', authMiddleware, upcomingController.getUpcomingServices);
maintenanceTaskRoutes.post('/upcoming', authMiddleware, upcomingController.createUpcomingService);
maintenanceTaskRoutes.put('/upcoming/:id/complete', authMiddleware, upcomingController.completeUpcomingService);

module.exports = maintenanceTaskRoutes;
