import React, { useState } from 'react';
import Dropzone from '../components/Dropzone';
import PaymentModal from '../components/PaymentModal';
import { convertWordToPdf } from '../services/api';
import { downloadBlob } from '../utils';

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [message, setMessage] = useState('');

  const handleConvert = async (paymentIntentId = null) => {
    if (!file) return;
    setStatus('converting');
    setMessage('');
    try {
      const res = await convertWordToPdf(file, paymentIntentId);

      if (res.headers['content-type']?.includes('application/json')) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        if (json.requiresPayment) {
          setPaymentInfo(json);
          setStatus('payment');
          return;
        }
      }

      downloadBlob(res.data, `converted_${file.name.replace(/\.docx?/, '')}.pdf`);
      setStatus('done');
      setMessage('✅ Conversion complete! Your file has been downloaded.');
    } catch (err) {
      const msg = err.response?.data?.error || 'Conversion failed. Please try again.';
      setStatus('error');
      setMessage(msg);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📝 Word → PDF</h2>
      <p style={styles.sub}>
        Convert Word documents to PDF. <strong>First page is free</strong> — $1 per additional page.
      </p>

      <Dropzone
        onFile={setFile}
        accept={{ 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] }}
        label="Drop your Word document here (.docx / .doc)"
        files={file ? [file] : []}
      />

      {file && status === 'idle' && (
        <button style={styles.btn} onClick={() => handleConvert()}>
          Convert to PDF
        </button>
      )}

      {status === 'converting' && <p style={styles.info}>⏳ Converting… please wait</p>}
      {status === 'done' && <p style={styles.success}>{message}</p>}
      {status === 'error' && <p style={styles.error}>{message}</p>}

      {status === 'payment' && paymentInfo && (
        <PaymentModal
          amount={paymentInfo.price}
          description={`Word → PDF conversion (${paymentInfo.pageCount} pages)`}
          onSuccess={(id) => { setStatus('idle'); handleConvert(id); }}
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
  btn: {
    marginTop: 20, width: '100%', padding: '14px 0', background: '#6b46c1',
    color: '#fff', border: 'none', borderRadius: 10, fontSize: 16,
    fontWeight: 600, cursor: 'pointer',
  },
  info: { marginTop: 16, color: '#553c9a', textAlign: 'center' },
  success: { marginTop: 16, color: '#276749', background: '#f0fff4', padding: '12px 16px', borderRadius: 8 },
  error: { marginTop: 16, color: '#c53030', background: '#fff5f5', padding: '12px 16px', borderRadius: 8 },
};
