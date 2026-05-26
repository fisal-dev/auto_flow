const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

const vehicleController = {
  getVehicles: async (req, res) => {
    try {
      if (req.user.role === 'customer') {
        const vehicles = await Vehicle.find({ userId: req.user.id });
        res.json(vehicles);
      } else {
        // For owner/manager, return all vehicles in the system populated with customer info
        const vehicles = await Vehicle.find({}).populate('userId', 'name email phone');
        res.json(vehicles);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getVehicleById: async (req, res) => {
    try {
      let query = { _id: req.params.id };
      if (req.user.role === 'customer') {
        query.userId = req.user.id;
      }
      const vehicle = await Vehicle.findOne(query).populate('userId', 'name email phone');
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createVehicle: async (req, res) => {
    try {
      const { make, model, year, vin, registration, mileage, image } = req.body;
      const vehicle = new Vehicle({
        make,
        model,
        year,
        vin,
        registration,
        mileage: mileage || '0 km',
        userId: req.user.id,
        status: 'success',
        image: image || ''
      });
      await vehicle.save();

      // Create system notification
      try {
        const Notification = require('../models/Notification');
        await new Notification({
          userId: req.user.id,
          message: `Your ${year} ${make} ${model} (${registration || 'No Reg'}) has been successfully added to your fleet.`,
          type: 'info',
          color: 'indigo'
        }).save();
      } catch (notifErr) {
        console.error('Failed to create vehicle notification:', notifErr.message);
      }

      res.status(201).json(vehicle);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateVehicle: async (req, res) => {
    try {
      let query = { _id: req.params.id };
      if (req.user.role === 'customer') {
        query.userId = req.user.id;
      }
      const vehicle = await Vehicle.findOneAndUpdate(
        query,
        { $set: req.body },
        { new: true }
      );
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteVehicle: async (req, res) => {
    try {
      let query = { _id: req.params.id };
      if (req.user.role === 'customer') {
        query.userId = req.user.id;
      }
      const vehicle = await Vehicle.findOneAndDelete(query);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.json({ message: 'Vehicle removed' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  searchVehicle: async (req, res) => {
    try {
      if (req.user.role !== 'owner' && req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied: Only owners and managers can search vehicles' });
      }
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const vehicle = await Vehicle.findOne({
        $or: [
          { registration: { $regex: new RegExp(`^${q}$`, 'i') } },
          { vin: { $regex: new RegExp(`^${q}$`, 'i') } }
        ]
      }).populate('userId', 'name email phone');

      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  quickRegister: async (req, res) => {
    try {
      if (req.user.role !== 'owner' && req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Access denied: Only owners and managers can register vehicles' });
      }
      const { make, model, year, vin, registration, mileage, customerEmail, customerName, customerPhone } = req.body;
      if (!make || !model || !year || !vin || !registration || !customerEmail) {
        return res.status(400).json({ message: 'Make, model, year, vin, registration, and customer email are required' });
      }

      let customer = await User.findOne({ email: customerEmail });
      let isNewCustomer = false;

      if (!customer) {
        isNewCustomer = true;
        customer = new User({
          name: customerName || customerEmail.split('@')[0],
          email: customerEmail,
          phone: customerPhone || '',
          password: 'welcome123', // temporary default password
          role: 'customer'
        });
        await customer.save();

        try {
          const Notification = require('../models/Notification');
          await new Notification({
            userId: customer._id,
            message: `Welcome to AutoFlow! A garage operator has registered your vehicle ${year} ${make} ${model} to log a service record. You can sign in using your email and password 'welcome123'. We recommend resetting your password inside settings.`,
            type: 'info',
            color: 'indigo'
          }).save();
        } catch (notifErr) {
          console.error('Failed to create notification for new customer:', notifErr.message);
        }
      }

      let existingVehicle = await Vehicle.findOne({
        $or: [
          { registration: { $regex: new RegExp(`^${registration}$`, 'i') } },
          { vin: { $regex: new RegExp(`^${vin}$`, 'i') } }
        ]
      });

      if (existingVehicle) {
        return res.status(400).json({ message: 'A vehicle with this registration plate or VIN already exists' });
      }

      const vehicle = new Vehicle({
        make,
        model,
        year,
        vin,
        registration,
        mileage: mileage || '0 km',
        userId: customer._id,
        status: 'success'
      });
      await vehicle.save();

      const responseVehicle = vehicle.toObject();
      responseVehicle.userId = {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      };

      res.status(201).json({ vehicle: responseVehicle, isNewCustomer });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = vehicleController;
