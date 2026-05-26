const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const dashboardController = require('../controllers/dashboardController');
const serviceCenterController = require('../controllers/serviceCenterController');
const complaintController = require('../controllers/complaintController');

const adminRouter = express.Router();

// Middleware to ensure role is admin or owner
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Admin/Owner permissions' });
  }
};

// Admin auth & profile
adminRouter.post('/login', userController.login);
adminRouter.get('/profile', authMiddleware, isAdmin, userController.getProfile);

// Admin dashboard metrics
adminRouter.get('/dashboard', authMiddleware, isAdmin, dashboardController.getAdminDashboardData);

// User & Manager Directories
adminRouter.get('/users', authMiddleware, isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

adminRouter.put('/users/:id/role', authMiddleware, isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const { role } = req.body;
    if (!['customer', 'owner', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

adminRouter.post('/users/register-admin', authMiddleware, isAdmin, async (req, res) => {
  try {
    const User = require('../models/User');
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const adminUser = new User({
      name: name || email.split('@')[0],
      email,
      password,
      role: 'owner'
    });
    await adminUser.save();
    res.status(201).json({ message: 'Admin account created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Admin store management
adminRouter.get('/stores', authMiddleware, isAdmin, serviceCenterController.getServiceCenters);
adminRouter.post('/stores', authMiddleware, isAdmin, serviceCenterController.createServiceCenter);

module.exports = adminRouter;
