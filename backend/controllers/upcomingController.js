const UpcomingService = require('../models/UpcomingService');
const Vehicle = require('../models/Vehicle');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const User = require('../models/User');

const upcomingController = {
  getUpcomingServices: async (req, res) => {
    try {
      let query = {};
      if (req.user.role === 'customer') {
        const vehicles = await Vehicle.find({ userId: req.user.id });
        const vehicleIds = vehicles.map(v => v._id);
        query = { vehicleId: { $in: vehicleIds } };
      } else if (req.user.role === 'admin' || req.user.role === 'owner') {
        // Admins and owners see all tasks of all garages
        query = {};
      } else if (req.user.role === 'manager') {
        // Managers see tasks scheduled at their assigned garages or with no provider
        const garages = req.user.assignedGarages || [];
        query = {
          $or: [
            { provider: { $in: garages } },
            { provider: { $in: ['', null] } },
            { provider: { $exists: false } }
          ]
        };
      } else {
        query = { _id: null }; // Default empty query for safety
      }

      const services = await UpcomingService.find(query)
        .populate('vehicleId', 'make model registration')
        .sort({ date: 1 });

      res.json(services);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createUpcomingService: async (req, res) => {
    try {
      const { vehicleId, date, description, urgency, provider } = req.body;
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

      const service = new UpcomingService({
        vehicleId,
        date,
        description,
        urgency: urgency || 'neutral',
        status: 'pending',
        provider: provider || ''
      });

      await service.save();

      // Create notification for customer
      try {
        const Notification = require('../models/Notification');
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        await new Notification({
          userId: vehicle.userId,
          message: `Scheduled service reminder for your ${vehicle.make} ${vehicle.model}: "${description}" on ${formattedDate}` + (provider ? ` at '${provider}'.` : '.'),
          type: urgency === 'warning' ? 'warning' : 'info',
          color: urgency === 'warning' ? 'amber' : 'indigo'
        }).save();
      } catch (notifErr) {
        console.error('Failed to create upcoming service notification:', notifErr.message);
      }

      res.status(201).json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  completeUpcomingService: async (req, res) => {
    try {
      const service = await UpcomingService.findById(req.params.id);
      if (!service) {
        return res.status(404).json({ message: 'Upcoming service not found' });
      }

      const vehicle = await Vehicle.findById(service.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }

      // Check authorization based on role
      if (req.user.role === 'customer') {
        if (vehicle.userId.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
      } else if (req.user.role === 'manager') {
        if (!req.user.assignedGarages.includes(service.provider)) {
          return res.status(403).json({ message: 'Unauthorized: Service is scheduled at a garage not assigned to you' });
        }
      } else if (req.user.role === 'owner') {
        const managers = await User.find({ ownerId: req.user.id, role: 'manager' });
        const managerGarages = managers.reduce((acc, m) => acc.concat(m.assignedGarages || []), []);
        const ownerGarages = req.user.assignedGarages || [];
        const allGarages = Array.from(new Set([...ownerGarages, ...managerGarages]));
        if (!allGarages.includes(service.provider)) {
          return res.status(403).json({ message: 'Unauthorized: Service is scheduled at a garage not part of your franchise' });
        }
      }

      const status = req.body.status || 'completed';
      service.status = status;
      await service.save();

      if (status === 'completed') {
        const cost = Number(req.body.cost) || 0;
        const notes = req.body.notes || '';
        const serviceDescription = notes ? `${service.description} (Notes: ${notes})` : service.description;

        // Log it to maintenance history too
        const record = new MaintenanceRecord({
          vehicleId: service.vehicleId,
          date: new Date(),
          service: serviceDescription,
          cost: cost,
          provider: service.provider || 'Scheduled Maintenance',
          status: 'success',
          label: 'Completed',
          paymentStatus: cost > 0 ? 'unpaid' : 'paid'
        });
        await record.save();

        // Create completion notification for the customer
        try {
          const Notification = require('../models/Notification');
          await new Notification({
            userId: vehicle.userId,
            message: `Service completed successfully for your ${vehicle.make} ${vehicle.model}: "${service.description}". Logged to maintenance history.`,
            type: 'info',
            color: 'indigo'
          }).save();
        } catch (notifErr) {
          console.error('Failed to create service completion notification:', notifErr.message);
        }
      }

      res.json(service);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = upcomingController;




module.exports = upcomingController;
