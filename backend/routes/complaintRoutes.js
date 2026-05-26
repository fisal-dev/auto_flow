const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const complaintController = require('../controllers/complaintController');

const complaintRoutes = express.Router();

complaintRoutes.get('/', authMiddleware, complaintController.getComplaints);
complaintRoutes.post('/', authMiddleware, complaintController.createComplaint);
complaintRoutes.put('/:id/assign', authMiddleware, complaintController.assignComplaint);
complaintRoutes.put('/:id/respond', authMiddleware, complaintController.respondToComplaint);

module.exports = complaintRoutes;
