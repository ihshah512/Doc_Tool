const express = require('express');
const router = express.Router();
const {
  isConfigured,
  createPaymentIntent,
  constructWebhookEvent,
} = require('../services/stripeHelper');

// POST /api/payment/create-intent
router.post('/create-intent', async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || amount < 50) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const result = await createPaymentIntent({ amount, description });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payment/webhook  (raw body, registered before express.json())
router.post('/webhook', (req, res) => {
  if (!isConfigured) {
    return res.json({ received: true, devMode: true });
  }
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    console.log('Payment succeeded:', event.data.object.id);
  }

  res.json({ received: true });
});

module.exports = router;
