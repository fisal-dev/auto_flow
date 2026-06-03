const Vehicle = require('../models/Vehicle');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const UpcomingService = require('../models/UpcomingService');
const FuelLog = require('../models/FuelLog');
const User = require('../models/User');
const ServiceCenter = require('../models/ServiceCenter');
const Complaint = require('../models/Complaint');

const dashboardController = {
  getDashboardData: async (req, res) => {
    try {
      if (req.user.role === 'customer') {
        const vehicles = await Vehicle.find({ userId: req.user.id });
        const vehicleIds = vehicles.map(v => v._id);

        const totalVehicles = vehicles.length;

        const pendingServices = await UpcomingService.countDocuments({
          vehicleId: { $in: vehicleIds },
          status: 'pending'
        });

        // Total Upkeep Cost
        const maintenanceRecords = await MaintenanceRecord.find({ vehicleId: { $in: vehicleIds } });
        const totalUpkeepCost = maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);

        // Average Fuel Cost (₹/km) fleet average
        const fuelLogs = await FuelLog.find({ vehicleId: { $in: vehicleIds } });
        const logsByVehicle = {};
        fuelLogs.forEach(log => {
          const vId = log.vehicleId.toString();
          if (!logsByVehicle[vId]) logsByVehicle[vId] = [];
          logsByVehicle[vId].push(log);
        });

        let totalFleetCost = 0;
        let totalFleetDistance = 0;
        let totalFleetLiters = 0;

        Object.keys(logsByVehicle).forEach(vId => {
          const list = logsByVehicle[vId];
          if (list.length > 1) {
            list.sort((a, b) => Number(a.mileage) - Number(b.mileage));
            const mileageDiff = Number(list[list.length - 1].mileage) - Number(list[0].mileage);
            const totalCost = list.slice(1).reduce((sum, log) => sum + Number(log.cost), 0);
            const totalLiters = list.slice(1).reduce((sum, log) => sum + Number(log.liters), 0);
            if (mileageDiff > 0) {
              totalFleetDistance += mileageDiff;
              totalFleetCost += totalCost;
              totalFleetLiters += totalLiters;
            }
          }
        });

        let avgFuelCost = 0;
        if (totalFleetDistance > 0) {
          avgFuelCost = totalFleetCost / totalFleetDistance;
        }
        const avgFuelCostStr = `₹${avgFuelCost.toFixed(2)}/km`;

        let avgEfficiency = 0;
        if (totalFleetDistance > 0 && totalFleetLiters > 0) {
          avgEfficiency = totalFleetDistance / totalFleetLiters;
        }
        const avgEfficiencyStr = `${avgEfficiency.toFixed(2)} km/L`;

        // Recent Service Logs
        const recentRecords = await MaintenanceRecord.find({ vehicleId: { $in: vehicleIds } })
          .populate('vehicleId', 'make model registration')
          .sort({ date: -1 })
          .limit(5);

        // Action Center items
        const actionCenter = [];
        
        // Add alerts if vehicles have warning/danger status
        vehicles.forEach(vehicle => {
          if (vehicle.status === 'warning') {
            actionCenter.push({
              id: `v-warn-${vehicle._id}`,
              title: `Service due for ${vehicle.make} ${vehicle.model}`,
              desc: `Odometer indicates vehicle has reached service interval.`,
              action: `/vehicles/${vehicle._id}`,
              urgency: 'warning'
            });
          } else if (vehicle.status === 'danger') {
            actionCenter.push({
              id: `v-dang-${vehicle._id}`,
              title: `Critical issue: ${vehicle.make} ${vehicle.model}`,
              desc: `Review active complaints or diagnostic errors immediately.`,
              action: `/complaint-history`,
              urgency: 'danger'
            });
          }
        });

        // Add upcoming services as alerts if due soon
        const soonServices = await UpcomingService.find({
          vehicleId: { $in: vehicleIds },
          status: 'pending'
        }).populate('vehicleId', 'make model').sort({ date: 1 }).limit(3);

        soonServices.forEach(s => {
          const days = Math.round((new Date(s.date) - new Date()) / (1000 * 60 * 60 * 24));
          actionCenter.push({
            id: `s-soon-${s._id}`,
            title: `Scheduled: ${s.description}`,
            desc: `Vehicle: ${s.vehicleId ? `${s.vehicleId.make} ${s.vehicleId.model}` : 'Unknown'}. Due in ${days} days.`,
            action: `/upcoming-services`,
            urgency: days <= 5 ? 'warning' : 'neutral'
          });
        });

        // Monthly costs data for charts (last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyCosts = {};
        const monthlyFuel = {};

        // Initialize last 6 months
        const chartData = [];
        const fuelChartData = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mName = months[d.getMonth()];
          monthlyCosts[mName] = 0;
          monthlyFuel[mName] = 0;
          chartData.push({ month: mName, cost: 0 });
          fuelChartData.push({ month: mName, liters: 0 });
        }

        // Aggregate maintenance records
        maintenanceRecords.forEach(r => {
          const rDate = new Date(r.date);
          const mName = months[rDate.getMonth()];
          if (monthlyCosts[mName] !== undefined) {
            monthlyCosts[mName] += r.cost || 0;
          }
        });

        // Aggregate fuel volumes
        fuelLogs.forEach(f => {
          const fDate = new Date(f.date);
          const mName = months[fDate.getMonth()];
          if (monthlyFuel[mName] !== undefined) {
            monthlyFuel[mName] += f.liters || 0;
          }
        });

        // Map back to chart format
        chartData.forEach(item => {
          item.cost = monthlyCosts[item.month];
        });

        fuelChartData.forEach(item => {
          item.liters = monthlyFuel[item.month];
        });

        res.json({
          isBusiness: false,
          stats: {
            totalVehicles,
            pendingServices,
            totalUpkeepCost,
            avgFuelCost: avgFuelCostStr,
            avgEfficiency: avgEfficiencyStr
          },
          chartData,
          fuelChartData,
          actionCenter,
          recentRecords
        });
      } else {
        // Business Dashboard for Owner/Manager
        let garages = [];
        if (req.user.role === 'manager') {
          garages = req.user.assignedGarages || [];
        } else if (req.user.role === 'owner') {
          const managers = await User.find({ ownerId: req.user.id, role: 'manager' });
          const managerGarages = managers.reduce((acc, m) => acc.concat(m.assignedGarages || []), []);
          const ownerGarages = req.user.assignedGarages || [];
          garages = Array.from(new Set([...ownerGarages, ...managerGarages]));
        }

        const businessRecords = await MaintenanceRecord.find({ provider: { $in: garages } })
          .populate({
            path: 'vehicleId',
            select: 'make model registration userId',
            populate: {
              path: 'userId',
              select: 'name email phone'
            }
          })
          .sort({ date: -1 });

        const totalRevenue = businessRecords
          .filter(r => r.paymentStatus === 'paid')
          .reduce((sum, r) => sum + (r.cost || 0), 0);

        const pendingInvoices = businessRecords
          .filter(r => r.paymentStatus === 'unpaid')
          .reduce((sum, r) => sum + (r.cost || 0), 0);

        // Count unique serviced vehicles
        const vehicleIdsSet = new Set();
        businessRecords.forEach(r => {
          if (r.vehicleId) {
            vehicleIdsSet.add(r.vehicleId._id.toString());
          }
        });
        const servicedVehicles = vehicleIdsSet.size;

        // Managers count
        let activeManagers = 0;
        if (req.user.role === 'owner') {
          activeManagers = await User.countDocuments({ ownerId: req.user.id, role: 'manager' });
        }

        const recentRecords = businessRecords.slice(0, 5);

        // Action Center items
        const actionCenter = [];
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const oldUnpaid = businessRecords.filter(r => r.paymentStatus === 'unpaid' && new Date(r.date) < threeDaysAgo);
        oldUnpaid.forEach(r => {
          const vehicleInfo = r.vehicleId ? `${r.vehicleId.make} ${r.vehicleId.model}` : 'Vehicle';
          const customerName = (r.vehicleId && r.vehicleId.userId) ? r.vehicleId.userId.name : 'Unknown';
          actionCenter.push({
            id: `unpaid-${r._id}`,
            title: `Overdue Invoice: ₹${r.cost.toLocaleString('en-IN')}`,
            desc: `Customer ${customerName}. Logged at '${r.provider}' for ${vehicleInfo}. Payment pending.`,
            action: '/garage-console',
            urgency: 'warning'
          });
        });

        if (req.user.role === 'manager' && garages.length === 0) {
          actionCenter.push({
            id: 'no-garages',
            title: 'No Garages Assigned',
            desc: 'Please contact the franchise owner to assign you to a Service Center.',
            action: '#',
            urgency: 'danger'
          });
        }

        // Monthly revenue & pending chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRevenue = {};
        const monthlyPending = {};

        const chartData = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const mName = months[d.getMonth()];
          monthlyRevenue[mName] = 0;
          monthlyPending[mName] = 0;
          chartData.push({ month: mName, revenue: 0, pending: 0 });
        }

        businessRecords.forEach(r => {
          const rDate = new Date(r.date);
          const mName = months[rDate.getMonth()];
          if (monthlyRevenue[mName] !== undefined) {
            if (r.paymentStatus === 'paid') {
              monthlyRevenue[mName] += r.cost || 0;
            } else {
              monthlyPending[mName] += r.cost || 0;
            }
          }
        });

        chartData.forEach(item => {
          item.revenue = monthlyRevenue[item.month];
          item.pending = monthlyPending[item.month];
        });

        res.json({
          isBusiness: true,
          stats: {
            totalRevenue,
            pendingInvoices,
            servicedVehicles,
            activeManagers
          },
          chartData,
          actionCenter,
          recentRecords
        });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getAdminDashboardData: async (req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const totalStores = await ServiceCenter.countDocuments();
      const totalComplaints = await Complaint.countDocuments({ status: { $ne: 'success' } });
      const totalVehicles = await Vehicle.countDocuments();

      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(3);
      const recentComplaints = await Complaint.find().populate('vehicleId', 'make model').sort({ createdAt: -1 }).limit(3);
      const recentStores = await ServiceCenter.find().sort({ createdAt: -1 }).limit(2);

      const recentActivity = [];
      recentUsers.forEach(u => {
        recentActivity.push({
          id: `u-${u._id}`,
          type: 'user',
          text: `User registered: ${u.email}`,
          time: u.createdAt
        });
      });
      recentComplaints.forEach(c => {
        recentActivity.push({
          id: `c-${c._id}`,
          type: 'complaint',
          text: `Complaint: ${c.description}`,
          time: c.createdAt
        });
      });
      recentStores.forEach(s => {
        recentActivity.push({
          id: `s-${s._id}`,
          type: 'store',
          text: `Service hub registered: ${s.name}`,
          time: s.createdAt
        });
      });

      recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

      res.json({
        totalUsers,
        totalStores,
        totalComplaints,
        totalVehicles,
        recentActivity: recentActivity.slice(0, 5)
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = dashboardController;
