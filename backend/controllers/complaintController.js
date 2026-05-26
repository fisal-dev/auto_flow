const Complaint = require('../models/Complaint');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const complaintController = {
  getComplaints: async (req, res) => {
    try {
      let query = {};

      if (req.user.role === 'customer') {
        const vehicles = await Vehicle.find({ userId: req.user.id });
        const vehicleIds = vehicles.map(v => v._id);
        query = { vehicleId: { $in: vehicleIds } };
      } else if (req.user.role === 'manager') {
        // Find complaints where the vehicle's associated store matches their assigned garages
        // Or if it is explicitly assigned to one of their stores
        // For simplicity, find complaints where the vehicle belongs to them or is assigned to their stores
        // Let's check service centers matching assigned garages
        const ServiceCenter = require('../models/ServiceCenter');
        const stores = await ServiceCenter.find({ name: { $in: req.user.assignedGarages } });
        const storeIds = stores.map(s => s._id);
        query = { 
          $or: [
            { assignedToStore: { $in: storeIds } }
          ]
        };
      } else if (req.user.role === 'owner' || req.user.role === 'admin') {
        // Owner/Admin sees all complaints
        query = {};
      }

      const complaints = await Complaint.find(query)
        .populate('vehicleId', 'make model registration')
        .populate('assignedToStore', 'name address')
        .sort({ date: -1 });

      res.json(complaints);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error: ' + err.message });
    }
  },

  createComplaint: async (req, res) => {
    try {
      const { vehicleId, description } = req.body;
      const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: req.user.id });
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
      }

      const complaint = new Complaint({
        vehicleId,
        description,
        date: new Date(),
        status: 'danger',
        label: 'Open'
      });

      await complaint.save();
      
      // Set vehicle status to danger
      vehicle.status = 'danger';
      await vehicle.save();

      res.status(201).json(complaint);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error: ' + err.message });
    }
  },

  assignComplaint: async (req, res) => {
    try {
      const { id } = req.params;
      const { storeId } = req.body;

      if (req.user.role !== 'admin' && req.user.role !== 'owner') {
        return res.status(403).json({ message: 'Unauthorized: Only Admin or Owner can assign complaints' });
      }

      const complaint = await Complaint.findById(id);
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

      complaint.assignedToStore = storeId;
      complaint.label = 'Investigating';
      complaint.status = 'warning';
      await complaint.save();

      res.json(complaint);
    } catch (err) {
      res.status(500).json({ message: 'Server error: ' + err.message });
    }
  },

  respondToComplaint: async (req, res) => {
    try {
      const { id } = req.params;
      const { response, status, label } = req.body;

      if (req.user.role !== 'manager' && req.user.role !== 'admin' && req.user.role !== 'owner') {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      const complaint = await Complaint.findById(id).populate('vehicleId');
      if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

      complaint.response = response || complaint.response;
      complaint.status = status || 'success'; // default to success if resolved
      complaint.label = label || 'Resolved';
      await complaint.save();

      // If status is success/Resolved, restore vehicle health status
      if (complaint.vehicleId && (label === 'Resolved' || status === 'success')) {
        const vehicle = await Vehicle.findById(complaint.vehicleId._id);
        if (vehicle) {
          vehicle.status = 'success';
          await vehicle.save();
        }
      }

      res.json(complaint);
    } catch (err) {
      res.status(500).json({ message: 'Server error: ' + err.message });
    }
  }
};

module.exports = complaintController;
