const express = require('express');
const userRouter = require('./userRouter');

const vehicleController = require('../controllers/vehicleController');
const dashboardController = require('../controllers/dashboardController');
const maintenanceController = require('../controllers/maintenanceController');
const upcomingController = require('../controllers/upcomingController');
const fuelController = require('../controllers/fuelController');
const complaintController = require('../controllers/complaintController');
const notificationController = require('../controllers/notificationController');
const serviceCenterController = require('../controllers/serviceCenterController');
const stripeController = require('../controllers/stripeController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.use("/user", userRouter);

// Dashboard routes
router.get("/dashboard", authMiddleware, dashboardController.getDashboardData);

// Vehicle routes
router.get("/vehicles", authMiddleware, vehicleController.getVehicles);
router.get("/vehicles/search", authMiddleware, vehicleController.searchVehicle);
router.post("/vehicles/quick-register", authMiddleware, vehicleController.quickRegister);
router.post("/vehicles", authMiddleware, vehicleController.createVehicle);
router.get("/vehicles/:id", authMiddleware, vehicleController.getVehicleById);
router.put("/vehicles/:id", authMiddleware, vehicleController.updateVehicle);
router.delete("/vehicles/:id", authMiddleware, vehicleController.deleteVehicle);

// Maintenance routes
router.get("/maintenance", authMiddleware, maintenanceController.getMaintenanceRecords);
router.post("/maintenance", authMiddleware, maintenanceController.createMaintenanceRecord);

// Upcoming Service routes
router.get("/upcoming", authMiddleware, upcomingController.getUpcomingServices);
router.post("/upcoming", authMiddleware, upcomingController.createUpcomingService);
router.put("/upcoming/:id/complete", authMiddleware, upcomingController.completeUpcomingService);

// Fuel routes
router.get("/fuel", authMiddleware, fuelController.getFuelLogs);
router.post("/fuel", authMiddleware, fuelController.createFuelLog);

// Complaint routes
router.get("/complaints", authMiddleware, complaintController.getComplaints);
router.post("/complaints", authMiddleware, complaintController.createComplaint);

// Notification routes
router.get("/notifications", authMiddleware, notificationController.getNotifications);
router.put("/notifications/:id/read", authMiddleware, notificationController.markRead);
router.delete("/notifications", authMiddleware, notificationController.clearAll);

// Service Center routes
router.get("/service-centers", authMiddleware, serviceCenterController.getServiceCenters);
router.post("/service-centers", authMiddleware, serviceCenterController.createServiceCenter);

// Stripe routes
router.post("/stripe/create-checkout-session", authMiddleware, stripeController.createCheckoutSession);
router.post("/stripe/pay-service", authMiddleware, stripeController.payService);
router.post("/stripe/verify-session", authMiddleware, stripeController.verifySession);

module.exports = router;