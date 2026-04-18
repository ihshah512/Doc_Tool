import React, { useState } from 'react';
import Dropzone from '../components/Dropzone';
import PaymentModal from '../components/PaymentModal';
import { mergePdfs } from '../services/api';
import { downloadBlob } from '../utils';

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [message, setMessage] = useState('');

  const addFiles = (newFiles) => {
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      const unique = newFiles.filter((f) => !names.has(f.name));
      return [...prev, ...unique];
    });
    setStatus('idle');
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleMerge = async (paymentIntentId = null) => {
    if (files.length < 2) return;
    setStatus('merging');
    setMessage('');
    try {
      const res = await mergePdfs(files, paymentIntentId);

      if (res.headers['content-type']?.includes('application/json')) {
        const text = await res.data.text();
        const json = JSON.parse(text);
        if (json.requiresPayment) {
          setPaymentInfo(json);
          setStatus('payment');
          return;
        }
      }

      downloadBlob(res.data, `merged_${Date.now()}.pdf`);
      setStatus('done');
      setMessage('✅ Merge complete! Your file has been downloaded.');
      setFiles([]);
    } catch (err) {
      const msg = err.response?.data?.error || 'Merge failed. Please try again.';
      setStatus('error');
      setMessage(msg);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🔗 Merge PDFs</h2>
      <p style={styles.sub}>
        Combine multiple PDFs into one file. Pricing: <strong>$1 per 5 pages</strong> (10 pages = $2, etc.).
      </p>

      <Dropzone
        onFile={addFiles}
        accept={{ 'application/pdf': ['.pdf'] }}
        label="Drop PDF files here (select multiple)"
        multiple
        files={[]}
      />

      {files.length > 0 && (
        <ul style={styles.list}>
          {files.map((f, i) => (
            <li key={i} style={styles.item}>
              <span>📄 {f.name}</span>
              <button style={styles.remove} onClick={() => removeFile(i)}>✕</button>
            </li>
          ))}
        </ul>
      )}

      {files.length >= 2 && status === 'idle' && (
        <button style={styles.btn} onClick={() => handleMerge()}>
          Merge {files.length} PDFs
        </button>
      )}

      {files.length === 1 && <p style={styles.info}>Add at least one more PDF to merge.</p>}
      {status === 'merging' && <p style={styles.info}>⏳ Merging… please wait</p>}
      {status === 'done' && <p style={styles.success}>{message}</p>}
      {status === 'error' && <p style={styles.error}>{message}</p>}

      {status === 'payment' && paymentInfo && (
        <PaymentModal
          amount={paymentInfo.price}
          description={`Merge ${paymentInfo.fileCount} PDFs (${paymentInfo.totalPages} pages)`}
          onSuccess={(id) => { setStatus('idle'); handleMerge(id); }}
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
  list: { listStyle: 'none', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: '#ebf8ff', padding: '10px 14px', borderRadius: 8, fontSize: 14, color: '#2b6cb0',
  },
  remove: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#e53e3e', fontSize: 16, fontWeight: 700,
  },
  btn: {
    marginTop: 20, width: '100%', padding: '14px 0', background: '#2f855a',
    color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer',
  },
  info: { marginTop: 16, color: '#2b6cb0', textAlign: 'center' },
  success: { marginTop: 16, color: '#276749', background: '#f0fff4', padding: '12px 16px', borderRadius: 8 },
  error: { marginTop: 16, color: '#c53030', background: '#fff5f5', padding: '12px 16px', borderRadius: 8 },
};
