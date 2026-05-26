const MaintenanceRecord = require('../models/MaintenanceRecord');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const maintenanceController = {
  getMaintenanceRecords: async (req, res) => {
    try {
      let query = {};
      if (req.user.role === 'customer') {
        const vehicles = await Vehicle.find({ userId: req.user.id });
        const vehicleIds = vehicles.map(v => v._id);
        query = { vehicleId: { $in: vehicleIds } };
      } else if (req.user.role === 'manager') {
        query = { provider: { $in: req.user.assignedGarages } };
      } else if (req.user.role === 'owner') {
        const managers = await User.find({ ownerId: req.user.id, role: 'manager' });
        const managerGarages = managers.reduce((acc, m) => acc.concat(m.assignedGarages || []), []);
        const ownerGarages = req.user.assignedGarages || [];
        const allGarages = Array.from(new Set([...ownerGarages, ...managerGarages]));
        query = { provider: { $in: allGarages } };
      }

      const records = await MaintenanceRecord.find(query)
        .populate('vehicleId', 'make model registration')
        .sort({ date: -1 });

      res.json(records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createMaintenanceRecord: async (req, res) => {
    try {
      const { vehicleId, date, service, cost, provider, status, label, attachment } = req.body;
      
      // Verify vehicle exists
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Check authorization based on role
      if (req.user.role === 'customer') {
        if (vehicle.userId.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Unauthorized: You do not own this vehicle' });
        }
      } else if (req.user.role === 'manager') {
        if (!req.user.assignedGarages.includes(provider)) {
          return res.status(403).json({ message: `Unauthorized: You are not assigned to the garage '${provider}'` });
        }
      } else if (req.user.role === 'owner') {
        const managers = await User.find({ ownerId: req.user.id, role: 'manager' });
        const managerGarages = managers.reduce((acc, m) => acc.concat(m.assignedGarages || []), []);
        const ownerGarages = req.user.assignedGarages || [];
        const allGarages = Array.from(new Set([...ownerGarages, ...managerGarages]));
        if (!allGarages.includes(provider)) {
          return res.status(403).json({ message: `Unauthorized: The garage '${provider}' is not part of your franchise` });
        }
      }

      const record = new MaintenanceRecord({
        vehicleId,
        date,
        service,
        cost: cost || 0,
        provider,
        status: status || 'success',
        label: label || 'Completed',
        paymentStatus: (cost && cost > 0) ? 'unpaid' : 'paid',
        attachment: attachment || ''
      });

      await record.save();

      // Create notification for the customer owning the vehicle
      try {
        const Notification = require('../models/Notification');
        await new Notification({
          userId: vehicle.userId,
          message: `A new maintenance record for your ${vehicle.make} ${vehicle.model} (${vehicle.registration}) was logged by '${provider}'.` + 
            (cost && cost > 0 ? ` Pending payment of ₹${cost.toLocaleString('en-IN')}.` : ''),
          type: (cost && cost > 0) ? 'warning' : 'info',
          color: (cost && cost > 0) ? 'amber' : 'indigo'
        }).save();
      } catch (notifErr) {
        console.error('Failed to notify customer about maintenance record:', notifErr.message);
      }

      res.status(201).json(record);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = maintenanceController;
