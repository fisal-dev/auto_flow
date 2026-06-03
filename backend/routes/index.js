const express = require('express');
const { upload } = require('../config/multer');
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
const upcomingController = require('../controllers/upcomingController');
const fuelController = require('../controllers/fuelController');
const serviceCenterController = require('../controllers/serviceCenterController');

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
router.use("/vehicles", vehicleRoutes);
router.use("/maintenance-task", maintenanceTaskRoutes);
router.use("/maintenance", maintenanceTaskRoutes);
router.use("/complaint", complaintRoutes);
router.use("/complaints", complaintRoutes);
router.use("/order", orderRouter);
router.use("/stripe", orderRouter);

// Direct mapping for upcoming tasks
router.get("/upcoming", authMiddleware, upcomingController.getUpcomingServices);
router.post("/upcoming", authMiddleware, upcomingController.createUpcomingService);
router.put("/upcoming/:id/complete", authMiddleware, upcomingController.completeUpcomingService);

router.get("/service-centers", authMiddleware, serviceCenterController.getServiceCenters);
router.post("/service-centers", authMiddleware, serviceCenterController.createServiceCenter);
router.delete("/service-centers/:id", authMiddleware, serviceCenterController.deleteServiceCenter);

// Direct mapping for fuel logs
const fuelRouter = express.Router();
fuelRouter.get("/", authMiddleware, fuelController.getFuelLogs);
fuelRouter.post("/", authMiddleware, fuelController.createFuelLog);
fuelRouter.delete("/:id", authMiddleware, fuelController.deleteFuelLog);
router.use("/fuel", fuelRouter);

// Direct mapping for notifications
const notificationController = require('../controllers/notificationController');
const notificationRouter = express.Router();
notificationRouter.get("/", authMiddleware, notificationController.getNotifications);
notificationRouter.put("/:id/read", authMiddleware, notificationController.markRead);
notificationRouter.delete("/", authMiddleware, notificationController.clearAll);
router.use("/notifications", notificationRouter);

// Dashboard routes
router.get("/dashboard", authMiddleware, dashboardController.getDashboardData);

module.exports = router;