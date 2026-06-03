const ServiceCenter = require('../models/ServiceCenter');

const serviceCenterController = {
  getServiceCenters: async (req, res) => {
    try {
      const centers = await ServiceCenter.find().sort({ rating: -1 });
      res.json(centers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createServiceCenter: async (req, res) => {
    try {
      const { name, location, contact, rating, status } = req.body;
      const center = new ServiceCenter({
        name,
        location,
        contact,
        rating: Number(rating) || 5.0,
        status: status || 'Open'
      });
      await center.save();

      // If the creator is a manager, auto-assign this newly created garage to their assignedGarages
      if (req.user && req.user.id) {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (user && user.role === 'manager') {
          if (!user.assignedGarages.includes(name)) {
            user.assignedGarages.push(name);
            await user.save();
          }
        }
      }

      res.status(201).json(center);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteServiceCenter: async (req, res) => {
    try {
      const center = await ServiceCenter.findById(req.params.id);
      if (!center) {
        return res.status(404).json({ message: 'Service center not found' });
      }

      const centerName = center.name;
      await ServiceCenter.findByIdAndDelete(req.params.id);

      // Remove from all users' assignedGarages
      const User = require('../models/User');
      await User.updateMany(
        { assignedGarages: centerName },
        { $pull: { assignedGarages: centerName } }
      );

      res.json({ message: 'Service center deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = serviceCenterController;
