const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const dashboardController = require('../controllers/dashboardController');
const serviceCenterController = require('../controllers/serviceCenterController');
const upcomingController = require('../controllers/upcomingController');

const managerRouter = express.Router();

const isManager = (req, res, next) => {
  if (req.user && (req.user.role === 'manager' || req.user.role === 'owner')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Manager or Owner role' });
  }
};

managerRouter.post('/login', userController.login);
managerRouter.get('/dashboard', authMiddleware, isManager, dashboardController.getDashboardData);
managerRouter.get('/stores', authMiddleware, isManager, serviceCenterController.getServiceCenters);
managerRouter.get('/team', authMiddleware, isManager, userController.getManagers);

module.exports = managerRouter;
