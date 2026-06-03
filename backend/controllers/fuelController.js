const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');

const fuelController = {
  getFuelLogs: async (req, res) => {
    try {
      let vehicleIds;
      if (req.user.role === 'customer') {
        const vehicles = await Vehicle.find({ userId: req.user.id });
        vehicleIds = vehicles.map(v => v._id);
      } else {
        const vehicles = await Vehicle.find({});
        vehicleIds = vehicles.map(v => v._id);
      }

      const logs = await FuelLog.find({ vehicleId: { $in: vehicleIds } })
        .populate('vehicleId', 'make model registration')
        .sort({ date: -1 });

      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createFuelLog: async (req, res) => {
    try {
      const { vehicleId, date, liters, cost, mileage } = req.body;
      const query = { _id: vehicleId };
      if (req.user.role === 'customer') {
        query.userId = req.user.id;
      }
      const vehicle = await Vehicle.findOne(query);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found or unauthorized' });
      }

      const log = new FuelLog({
        vehicleId,
        date: date || new Date(),
        liters: Number(liters),
        cost: Number(cost),
        mileage: Number(mileage)
      });

      await log.save();

      // Update vehicle's mileage telemetry dynamically
      vehicle.mileage = `${Number(mileage).toLocaleString()} km`;
      await vehicle.save();

      res.status(201).json(log);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteFuelLog: async (req, res) => {
    try {
      const log = await FuelLog.findById(req.params.id);
      if (!log) {
        return res.status(404).json({ message: 'Fuel log not found' });
      }

      const vehicle = await Vehicle.findById(log.vehicleId);
      if (req.user.role === 'customer') {
        if (!vehicle || vehicle.userId.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
      }

      await FuelLog.findByIdAndDelete(req.params.id);
      res.json({ message: 'Fuel log deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = fuelController;
