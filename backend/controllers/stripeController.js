const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51O123456789012345678901234567890abcdef');
const User = require('../models/User');
const MaintenanceRecord = require('../models/MaintenanceRecord');

const stripeController = {
  createCheckoutSession: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        try {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name
          });
          customerId = customer.id;
          user.stripeCustomerId = customerId;
          await user.save();
        } catch (err) {
          console.error('Stripe Customer Create Error:', err);
        }
      }

      let origin = process.env.CLIENT_URL || process.env.FRONTEND_URL;
      if (!origin) {
        origin = req.get('origin') || req.headers.origin;
        if (!origin && req.get('referer')) {
          try {
            const refUrl = new URL(req.get('referer'));
            origin = refUrl.origin;
          } catch (e) {}
        }
      }
      if (!origin) origin = 'http://localhost:8080';
      origin = origin.replace(/\/$/, '');

      const session = await stripe.checkout.sessions.create({
        customer: customerId || undefined,
        customer_email: customerId ? undefined : user.email,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'AutoFlow Premium Subscription',
                description: 'Full-featured premium fleet tracker access (₹999/month)',
              },
              unit_amount: 99900, // ₹999.00
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/settings?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${origin}/settings?success=false`,
        metadata: {
          userId: user._id.toString(),
          type: 'subscription'
        }
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Stripe integration error: ' + err.message });
    }
  },

  payService: async (req, res) => {
    try {
      const { recordId } = req.body;
      const record = await MaintenanceRecord.findById(recordId).populate('vehicleId');
      if (!record) return res.status(404).json({ message: 'Maintenance record not found' });

      const user = await User.findById(req.user.id);

      let origin = process.env.CLIENT_URL || process.env.FRONTEND_URL;
      if (!origin) {
        origin = req.get('origin') || req.headers.origin;
        if (!origin && req.get('referer')) {
          try {
            const refUrl = new URL(req.get('referer'));
            origin = refUrl.origin;
          } catch (e) {}
        }
      }
      if (!origin) origin = 'http://localhost:8080';
      origin = origin.replace(/\/$/, '');

      const session = await stripe.checkout.sessions.create({
        customer: user?.stripeCustomerId || undefined,
        customer_email: user?.stripeCustomerId ? undefined : user?.email,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `Service Invoice: ${record.service}`,
                description: `Performed by ${record.provider} on ${record.vehicleId ? `${record.vehicleId.make} ${record.vehicleId.model}` : 'vehicle'}.`,
              },
              unit_amount: record.cost * 100, // in paise
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/maintenance?success=true&session_id={CHECKOUT_SESSION_ID}&record_id=${record._id}`,
        cancel_url: `${origin}/maintenance?success=false`,
        metadata: {
          recordId: record._id.toString(),
          type: 'invoice'
        }
      });

      record.stripeSessionId = session.id;
      await record.save();

      res.json({ url: session.url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Stripe invoice creation error: ' + err.message });
    }
  },

  verifySession: async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (session.payment_status === 'paid' || session.status === 'complete') {
        const { type, userId, recordId } = session.metadata || {};

        if (type === 'subscription' || session.mode === 'subscription') {
          const targetUserId = userId || session.client_reference_id || req.user.id;
          const updatedUser = await User.findByIdAndUpdate(
            targetUserId, 
            { subscriptionStatus: 'premium' },
            { new: true }
          );
          console.log(`User ${targetUserId} verified and upgraded to premium via redirect.`);
          return res.json({ success: true, status: 'premium', user: updatedUser });
        } else if (type === 'invoice' || session.mode === 'payment') {
          const targetRecordId = recordId;
          let updatedRecord;
          if (targetRecordId) {
            updatedRecord = await MaintenanceRecord.findByIdAndUpdate(
              targetRecordId, 
              { paymentStatus: 'paid' },
              { new: true }
            );
            console.log(`Invoice ${targetRecordId} verified and marked as paid via redirect.`);
          } else {
            updatedRecord = await MaintenanceRecord.findOneAndUpdate(
              { stripeSessionId: session.id }, 
              { paymentStatus: 'paid' },
              { new: true }
            );
            console.log(`Invoice with session id ${session.id} verified and marked as paid via redirect.`);
          }
          return res.json({ success: true, status: 'paid', record: updatedRecord });
        }
      }

      res.json({ success: false, message: 'Payment not completed yet' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error verifying Stripe session: ' + err.message });
    }
  },

  webhook: async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      const rawBody = req.body;
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { type, userId, recordId } = session.metadata || {};

      if (type === 'subscription' || session.mode === 'subscription') {
        const targetUserId = userId || session.client_reference_id;
        // If type is not in metadata, try finding by customer email or ID
        if (targetUserId) {
          await User.findByIdAndUpdate(targetUserId, { subscriptionStatus: 'premium' });
          console.log(`User ${targetUserId} upgraded to premium.`);
        } else if (session.customer) {
          await User.findOneAndUpdate({ stripeCustomerId: session.customer }, { subscriptionStatus: 'premium' });
          console.log(`Customer ${session.customer} upgraded to premium.`);
        }
      } else if (type === 'invoice' || session.mode === 'payment') {
        const targetRecordId = recordId;
        if (targetRecordId) {
          await MaintenanceRecord.findByIdAndUpdate(targetRecordId, { paymentStatus: 'paid' });
          console.log(`Invoice ${targetRecordId} marked as paid.`);
        } else {
          // fallback search by stripeSessionId
          await MaintenanceRecord.findOneAndUpdate({ stripeSessionId: session.id }, { paymentStatus: 'paid' });
          console.log(`Invoice with session id ${session.id} marked as paid.`);
        }
      }
    }

    res.json({ received: true });
  }
};

module.exports = stripeController;
