const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const serviceCenterController = require('../controllers/serviceCenterController');

const storeRouter = express.Router();

storeRouter.get('/', authMiddleware, serviceCenterController.getServiceCenters);
storeRouter.post('/', authMiddleware, serviceCenterController.createServiceCenter);

module.exports = storeRouter;
