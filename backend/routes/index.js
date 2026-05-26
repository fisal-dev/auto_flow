const express = require('express');
const { upload } = require('../config/cloudinary');
const uploadController = require('../controllers/uploadController');
const userRouter = require('./userRouter');
const adminRouter = require('./adminRouter');
const managerRouter = require('./managerRouter');
const ownerRouter = require('./ownerRouter');
const storeRouter = require('./storeRouter');
const vehicleRoutes = require('./vehicleRoutes');
const maintenanceTaskRoutes = require('./maintenanceTaskRoutes');
const complaintRoutes = require('./complaintRoutes');
const orderRouter = require('./orderRouter');

const authMiddleware = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Backward-compatible userRouter
router.use("/user", userRouter);

// Upload Route
router.post('/upload', authMiddleware, upload.single('file'), uploadController.uploadFile);

// Spec-compliant role & resource routers
router.use("/admin", adminRouter);
router.use("/manager", managerRouter);
router.use("/owner", ownerRouter);
router.use("/store", storeRouter);
router.use("/vehicle", vehicleRoutes);
router.use("/maintenance-task", maintenanceTaskRoutes);
router.use("/complaint", complaintRoutes);
router.use("/order", orderRouter);

// Dashboard routes
router.get("/dashboard", authMiddleware, dashboardController.getDashboardData);

module.exports = router;