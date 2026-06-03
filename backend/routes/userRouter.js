const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const userRouter = express.Router();

userRouter.post('/login', userController.login);
userRouter.post('/register', userController.register);
userRouter.post('/forgot-password', userController.forgotPassword);
userRouter.post('/verify-reset-code', userController.verifyResetCode);
userRouter.post('/reset-password', userController.resetPassword);
userRouter.post('/verify-device', userController.verifyDevice);
userRouter.post('/logout-device', userController.logoutDevice);
userRouter.get('/profile', authMiddleware, userController.getProfile);
userRouter.put('/profile', authMiddleware, userController.updateProfile);
userRouter.put('/change-password', authMiddleware, userController.changePassword);
userRouter.get('/settings', authMiddleware, userController.getSettings);
userRouter.put('/settings', authMiddleware, userController.updateSettings);

// Manager management routes for owners
userRouter.get('/managers', authMiddleware, userController.getManagers);
userRouter.post('/managers', authMiddleware, userController.createManager);
userRouter.put('/managers/:id', authMiddleware, userController.updateManager);
userRouter.delete('/managers/:id', authMiddleware, userController.deleteManager);

module.exports = userRouter;