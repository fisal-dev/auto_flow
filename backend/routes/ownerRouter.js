const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

const ownerRouter = express.Router();

const isOwner = (req, res, next) => {
  if (req.user && req.user.role === 'owner') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Owner role' });
  }
};

ownerRouter.post('/login', userController.login);
ownerRouter.post('/register', userController.register); // Or generic register
ownerRouter.get('/profile', authMiddleware, isOwner, userController.getProfile);
ownerRouter.put('/profile', authMiddleware, isOwner, userController.updateProfile);

// Manager management routes
ownerRouter.get('/managers', authMiddleware, isOwner, userController.getManagers);
ownerRouter.post('/managers', authMiddleware, isOwner, userController.createManager);
ownerRouter.put('/managers/:id', authMiddleware, isOwner, userController.updateManager);
ownerRouter.delete('/managers/:id', authMiddleware, isOwner, userController.deleteManager);

module.exports = ownerRouter;
