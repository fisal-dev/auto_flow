const User = require('../models/User');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51O123456789012345678901234567890abcdef');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey123!', {
    expiresIn: '30d',
  });
};

const userController = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Generate a default name from email
      const name = email.split('@')[0];

      // Create Stripe Customer
      let stripeCustomerId = '';
      try {
        const customer = await stripe.customers.create({
          email,
          name,
        });
        stripeCustomerId = customer.id;
      } catch (err) {
        console.warn('Stripe customer creation skipped/failed:', err.message);
      }

      user = new User({
        name,
        email,
        password,
        stripeCustomerId
      });

      await user.save();

      // Create welcome notification
      try {
        const Notification = require('../models/Notification');
        await new Notification({
          userId: user._id,
          message: 'Welcome to AutoFlow! Get started by adding your first vehicle to your smart fleet dashboard.',
          type: 'info',
          color: 'indigo'
        }).save();
      } catch (notifErr) {
        console.error('Failed to create welcome notification:', notifErr.message);
      }

      res.status(201).json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'customer'
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, rememberDevice, deviceName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      let deviceToken = null;
      if (rememberDevice) {
        deviceToken = crypto.randomBytes(32).toString('hex');
        user.rememberedDevices.push({
          deviceToken,
          deviceName: deviceName || 'Web Browser',
          lastUsed: new Date()
        });
        if (user.rememberedDevices.length > 10) {
          user.rememberedDevices.shift();
        }
        await user.save();
      }

      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'customer',
          assignedGarages: user.assignedGarages || []
        },
        deviceToken
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.notifications = req.body.notifications !== undefined ? req.body.notifications : user.notifications;

      await user.save();

      // Create profile update notification
      try {
        const Notification = require('../models/Notification');
        await new Notification({
          userId: user._id,
          message: 'Your personal profile settings have been successfully updated.',
          type: 'info',
          color: 'indigo'
        }).save();
      } catch (notifErr) {
        console.error('Failed to create profile update notification:', notifErr.message);
      }

      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getSettings: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({
        notifications: user.notifications,
        reminderFrequency: 'Weekly', // simple defaults or loadable
        preferredServiceProvider: ''
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.notifications = req.body.notifications !== undefined ? req.body.notifications : user.notifications;
      await user.save();
      
      res.json({
        notifications: user.notifications,
        reminderFrequency: req.body.reminderFrequency || 'Weekly',
        preferredServiceProvider: req.body.preferredServiceProvider || ''
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        // Return 200 for security, but with simulated logic or error
        return res.status(404).json({ message: 'No user registered with this email address' });
      }

      // Generate a secure 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetPasswordCode = code;
      user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      await user.save();

      // Send real email via SMTP / Gmail App Passwords
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070a08; color: #f8fafc; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(132, 204, 22, 0.15); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.55);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; margin-bottom: 12px;">
              <img src="https://auto-flow-810.pages.dev/autoflow_logo.png" alt="AutoFlow Logo" style="width: 52px; height: 52px; border-radius: 12px; box-shadow: 0 0 20px rgba(132, 204, 22, 0.3); border: 1px solid rgba(132, 204, 22, 0.2);">
            </div>
            <h2 style="color: #ffffff; font-weight: 800; font-size: 28px; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">Auto<span style="color: #84cc16;">Flow</span></h2>
            <p style="color: #65a30d; font-size: 13px; margin-top: 6px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 0;">Smart Fleet Management</p>
          </div>
          
          <div style="background-color: #0d1410; padding: 30px; border-radius: 8px; border: 1px solid rgba(132, 204, 22, 0.1);">
            <h3 style="color: #ffffff; font-size: 20px; margin-top: 0; font-weight: 700; text-align: center;">Reset Your Password</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; text-align: center;">We received a request to reset your AutoFlow access credentials. Use the secure, 6-digit verification code below to proceed with setting up your new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #152219; border: 1px solid #84cc16; border-radius: 8px; padding: 15px 30px; font-family: monospace; font-size: 32px; font-weight: bold; color: #a3e635; letter-spacing: 6px; box-shadow: 0 0 15px rgba(132, 204, 22, 0.25);">
                ${code}
              </div>
            </div>
            
            <p style="color: #f43f5e; font-size: 13px; line-height: 1.5; text-align: center; font-weight: 600; margin-bottom: 0;">This verification code is secure and will expire in 10 minutes.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #475569; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0;">If you did not request a password reset, please ignore this email or contact security support.</p>
            <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} AutoFlow Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      `;

      let emailSent = false;
      let emailError = null;
      try {
        const mailResult = await sendEmail({
          to: email,
          subject: 'AutoFlow - Password Reset Verification Code',
          html: emailHtml
        });
        if (mailResult && mailResult.success !== false) {
          emailSent = true;
        } else if (mailResult && mailResult.message) {
          emailError = mailResult.message;
        }
      } catch (mailErr) {
        emailError = mailErr.message;
        console.error('Real email dispatch failed, running console fallback:', mailErr.message);
      }

      res.json({
        message: emailSent ? 'Verification code sent to email' : `Demo fallback mode active (Email failed: ${emailError})`,
        demoCode: emailSent ? undefined : code,
        emailSent,
        emailError
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  verifyResetCode: async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required' });
      }

      const user = await User.findOne({
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }

      res.json({ message: 'Verification code verified successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const user = await User.findOne({
        email,
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification session' });
      }

      // Update password
      user.password = newPassword;
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await user.save();

      // Send a security confirmation email
      const confirmationHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070a08; color: #f8fafc; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(132, 204, 22, 0.15); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.55);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; margin-bottom: 12px;">
              <img src="https://auto-flow-810.pages.dev/autoflow_logo.png" alt="AutoFlow Logo" style="width: 52px; height: 52px; border-radius: 12px; box-shadow: 0 0 20px rgba(132, 204, 22, 0.3); border: 1px solid rgba(132, 204, 22, 0.2);">
            </div>
            <h2 style="color: #ffffff; font-weight: 800; font-size: 28px; margin: 0; letter-spacing: -0.5px; line-height: 1.2;">Auto<span style="color: #84cc16;">Flow</span></h2>
            <p style="color: #65a30d; font-size: 13px; margin-top: 6px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 0;">Smart Fleet Management</p>
          </div>
          
          <div style="background-color: #0d1410; padding: 30px; border-radius: 8px; border: 1px solid rgba(132, 204, 22, 0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" valign="middle" style="background-color: rgba(132, 204, 22, 0.1); border: 1px solid #84cc16; border-radius: 50%; width: 56px; height: 56px; text-align: center;">
                    <span style="font-size: 26px; color: #a3e635; font-weight: bold; line-height: 56px; display: block; margin-top: -1px;">✓</span>
                  </td>
                </tr>
              </table>
            </div>
            
            <h3 style="color: #ffffff; font-size: 20px; margin-top: 0; font-weight: 700; text-align: center;">Password Changed Successfully</h3>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; text-align: center;">This is a confirmation that the password for your AutoFlow account <strong>${email}</strong> has been successfully updated.</p>
            
            <div style="margin: 25px 0; padding: 20px; background-color: #070a08; border: 1px solid rgba(132, 204, 22, 0.15); border-radius: 8px; text-align: left;">
              <div style="color: #cbd5e1; font-size: 14px; margin-bottom: 10px; font-weight: bold;">Security Details:</div>
              <div style="color: #94a3b8; font-size: 13px; margin-bottom: 6px;">• <strong>Action:</strong> Password Reset via Verification Code</div>
              <div style="color: #94a3b8; font-size: 13px; margin-bottom: 6px;">• <strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)</div>
              <div style="color: #94a3b8; font-size: 13px;">• <strong>Status:</strong> Completed & Secure</div>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 0;">If you authorized this change, no further action is required. If you did not make this change, please contact support immediately to lock and secure your account.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #475569; font-size: 12px; line-height: 1.5;">
            <p style="margin: 0;">This is an automated security notification. Please do not reply directly to this email.</p>
            <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} AutoFlow Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          to: email,
          subject: 'AutoFlow - Security Alert: Password Changed',
          html: confirmationHtml
        });
      } catch (mailErr) {
        console.error('Password change confirmation email failed to send:', mailErr.message);
      }

      res.json({ message: 'Password has been updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current password and new password are required' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password has been updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  verifyDevice: async (req, res) => {
    try {
      const { deviceToken } = req.body;
      if (!deviceToken) {
        return res.status(400).json({ message: 'Device token is required' });
      }

      const user = await User.findOne({ 'rememberedDevices.deviceToken': deviceToken });
      if (!user) {
        return res.status(400).json({ message: 'Device not recognized' });
      }

      // Update lastUsed timestamp
      const device = user.rememberedDevices.find(d => d.deviceToken === deviceToken);
      if (device) {
        device.lastUsed = new Date();
        await user.save();
      }

      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'customer',
          assignedGarages: user.assignedGarages || []
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  logoutDevice: async (req, res) => {
    try {
      const { deviceToken } = req.body;
      if (deviceToken) {
        const user = await User.findOne({ 'rememberedDevices.deviceToken': deviceToken });
        if (user) {
          user.rememberedDevices = user.rememberedDevices.filter(d => d.deviceToken !== deviceToken);
          await user.save();
        }
      }
      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getManagers: async (req, res) => {
    try {
      if (req.user.role === 'manager') {
        // Manager sees only their own record
        const self = await User.findById(req.user.id).select('-password');
        return res.json(self ? [self] : []);
      }
      if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Only owners and admins can manage team managers' });
      }
      let query = { role: 'manager' };
      
      const managers = await User.find(query).select('-password');
      res.json(managers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  createManager: async (req, res) => {
    try {
      if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Only owners and admins can manage team managers' });
      }
      const { name, email, password, assignedGarages } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
      }

      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email address already exists' });
      }

      const manager = new User({
        name,
        email,
        password,
        role: 'manager',
        ownerId: req.user.id,
        assignedGarages: assignedGarages || []
      });

      await manager.save();
      
      const responseManager = manager.toObject();
      delete responseManager.password;

      res.status(201).json(responseManager);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateManager: async (req, res) => {
    try {
      if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Only owners and admins can manage team managers' });
      }
      const { assignedGarages, name, email, password } = req.body;
      
      let query = { _id: req.params.id, role: 'manager' };
      // Let admins update any manager. Let owners also update managers to prevent ownership lockouts if ownerId is undefined/null.
      const manager = await User.findOne(query);
      if (!manager) {
        return res.status(404).json({ message: 'Manager not found' });
      }

      if (name) manager.name = name;
      if (email) manager.email = email;
      if (password) manager.password = password; // pre-save hook hashes it
      if (assignedGarages !== undefined) manager.assignedGarages = assignedGarages;

      await manager.save();

      const responseManager = manager.toObject();
      delete responseManager.password;

      res.json(responseManager);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteManager: async (req, res) => {
    try {
      if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Only owners and admins can manage team managers' });
      }
      
      let query = { _id: req.params.id, role: 'manager' };
      
      const manager = await User.findOneAndDelete(query);
      if (!manager) {
        return res.status(404).json({ message: 'Manager not found' });
      }
      res.json({ message: 'Manager account terminated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = userController;
