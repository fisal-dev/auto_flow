const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const stripeController = require('../controllers/stripeController');

const orderRouter = express.Router();

orderRouter.post('/create-checkout-session', authMiddleware, stripeController.createCheckoutSession);
orderRouter.post('/pay-service', authMiddleware, stripeController.payService);
orderRouter.post('/verify-session', authMiddleware, stripeController.verifySession);

module.exports = orderRouter;
