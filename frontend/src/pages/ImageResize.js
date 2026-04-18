import React, { useState } from 'react';
import Dropzone from '../components/Dropzone';
import PaymentModal from '../components/PaymentModal';
import { resizeImage } from '../services/api';
import { downloadBlob } from '../utils';

export default function ImageResize() {
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [status, setStatus] = useState('idle');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [message, setMessage] = useState('');

  const handleResize = async (paymentIntentId = null) => {
    if (!file || !width || !height) return;
    setStatus('resizing');
    setMessage('');
    try {
      const res = await resizeImage(file, parseInt(width), parseInt(height), paymentIntentId);

      if (res.headers['content-type']?.includes('application/json')) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        if (json.requiresPayment) {
          setPaymentInfo(json);
          setStatus('payment');
          return;
        }
      }

      const ext = file.name.split('.').pop();
      downloadBlob(res.data, `resized_${width}x${height}.${ext}`);
      setStatus('done');
      setMessage(`✅ Image resized to ${width}×${height}px and downloaded!`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Resize failed. Please try again.';
      setStatus('error');
      setMessage(msg);
    }
  };

  const ready = file && width > 0 && height > 0 && status === 'idle';

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🖼️ Image Resize</h2>
      <p style={styles.sub}>
        Resize any image to exact pixel dimensions. <strong>$1 per conversion.</strong>
      </p>

      <Dropzone
        onFile={(f) => { setFile(f); setStatus('idle'); }}
        accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }}
        label="Drop your image here (JPG, PNG, WebP)"
        files={file ? [file] : []}
      />

      <div style={styles.inputs}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Width (px)</label>
          <input
            type="number"
            min="1"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            placeholder="e.g. 800"
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Height (px)</label>
          <input
            type="number"
            min="1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="e.g. 600"
            style={styles.input}
          />
        </div>
      </div>

      {ready && (
        <button style={styles.btn} onClick={() => handleResize()}>
          Resize Image – $1.00
        </button>
      )}

      {status === 'resizing' && <p style={styles.info}>⏳ Resizing… please wait</p>}
      {status === 'done' && <p style={styles.success}>{message}</p>}
      {status === 'error' && <p style={styles.error}>{message}</p>}

      {status === 'payment' && paymentInfo && (
        <PaymentModal
          amount={paymentInfo.price}
          description={`Image resize to ${paymentInfo.width}×${paymentInfo.height}px`}
          onSuccess={(id) => { setStatus('idle'); handleResize(id); }}
          onCancel={() => setStatus('idle')}
        />
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 600, margin: '0 auto' },
  heading: { fontSize: 24, fontWeight: 700, color: '#1a202c', marginBottom: 8 },
  sub: { color: '#4a5568', marginBottom: 24, lineHeight: 1.6 },
  inputs: { display: 'flex', gap: 16, marginTop: 20 },
  inputGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#4a5568' },
  input: {
    padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
    fontSize: 15, outline: 'none', color: '#1a202c',
  },
  btn: {
    marginTop: 20, width: '100%', padding: '14px 0', background: '#dd6b20',
    color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer',
  },
  info: { marginTop: 16, color: '#744210', textAlign: 'center' },
  success: { marginTop: 16, color: '#276749', background: '#f0fff4', padding: '12px 16px', borderRadius: 8 },
  error: { marginTop: 16, color: '#c53030', background: '#fff5f5', padding: '12px 16px', borderRadius: 8 },
};
