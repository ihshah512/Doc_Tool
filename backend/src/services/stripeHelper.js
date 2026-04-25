const key = process.env.STRIPE_SECRET_KEY || '';
const isConfigured = key.startsWith('sk_') && !key.includes('YOUR_STRIPE_SECRET_KEY');

const stripe = isConfigured ? require('stripe')(key) : null;

async function createPaymentIntent({ amount, description }) {
  if (!isConfigured) {
    const fakeId = `pi_dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return {
      clientSecret: `${fakeId}_secret_dev`,
      paymentIntentId: fakeId,
      devMode: true,
    };
  }
  const intent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    description: description || 'DocTools service',
    automatic_payment_methods: { enabled: true },
  });
  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  };
}

async function verifyPayment(paymentIntentId) {
  if (!isConfigured) {
    if (paymentIntentId && paymentIntentId.startsWith('pi_dev_')) {
      return { ok: true, devMode: true };
    }
    return { ok: true, devMode: true };
  }
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return { ok: false, error: 'Payment not completed' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: `Payment verification failed: ${err.message}` };
  }
}

function constructWebhookEvent(rawBody, signature) {
  if (!isConfigured) return null;
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = { isConfigured, createPaymentIntent, verifyPayment, constructWebhookEvent };
