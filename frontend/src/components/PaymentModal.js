import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent } from '../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CARD_STYLE = {
  style: {
    base: { fontSize: '16px', color: '#1a202c', '::placeholder': { color: '#a0aec0' } },
    invalid: { color: '#e53e3e' },
  },
};

function CheckoutForm({ amount, description, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const { data } = await createPaymentIntent(amount, description);
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.title}>Complete Payment</h3>
      <p style={styles.amount}>{description}</p>
      <p style={styles.price}>Total: ${(amount / 100).toFixed(2)}</p>

      <div style={styles.cardBox}>
        <CardElement options={CARD_STYLE} />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.row}>
        <button type="button" onClick={onCancel} style={styles.cancelBtn} disabled={loading}>
          Cancel
        </button>
        <button type="submit" style={styles.payBtn} disabled={!stripe || loading}>
          {loading ? 'Processing…' : `Pay $${(amount / 100).toFixed(2)}`}
        </button>
      </div>

      <p style={styles.test}>
        🧪 Test card: <code>4242 4242 4242 4242</code> · any future date · any CVC
      </p>
    </form>
  );
}

export default function PaymentModal({ amount, description, onSuccess, onCancel }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            amount={amount}
            description={description}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 12, padding: 32, width: '100%',
    maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  title: { fontSize: 22, fontWeight: 700, color: '#1a202c' },
  amount: { color: '#4a5568', fontSize: 14 },
  price: { fontSize: 20, fontWeight: 700, color: '#2b6cb0' },
  cardBox: {
    border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 12px',
    background: '#f7fafc',
  },
  error: { color: '#e53e3e', fontSize: 14, background: '#fff5f5', padding: '8px 12px', borderRadius: 6 },
  row: { display: 'flex', gap: 12 },
  cancelBtn: {
    flex: 1, padding: '12px 0', border: '1px solid #e2e8f0', borderRadius: 8,
    background: '#fff', cursor: 'pointer', fontSize: 15, color: '#4a5568',
  },
  payBtn: {
    flex: 2, padding: '12px 0', background: '#3182ce', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600,
  },
  test: { fontSize: 12, color: '#718096', background: '#fffbeb', padding: '8px 10px', borderRadius: 6 },
};
