import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// ── Payment ──────────────────────────────────────────────
export const createPaymentIntent = (amount, description) =>
  API.post('/api/payment/create-intent', { amount, description });

// ── Conversion ───────────────────────────────────────────
export const convertPdfToWord = (file, paymentIntentId = null) => {
  const form = new FormData();
  form.append('file', file);
  if (paymentIntentId) form.append('paymentIntentId', paymentIntentId);
  return API.post('/api/convert/pdf-to-word', form, { responseType: 'blob' });
};

export const convertWordToPdf = (file, paymentIntentId = null) => {
  const form = new FormData();
  form.append('file', file);
  if (paymentIntentId) form.append('paymentIntentId', paymentIntentId);
  return API.post('/api/convert/word-to-pdf', form, { responseType: 'blob' });
};

export const getPageCount = (file) => {
  const form = new FormData();
  form.append('file', file);
  return API.post('/api/convert/page-count', form);
};

// ── Merge ────────────────────────────────────────────────
export const mergePdfs = (files, paymentIntentId = null) => {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  if (paymentIntentId) form.append('paymentIntentId', paymentIntentId);
  return API.post('/api/merge/pdfs', form, { responseType: 'blob' });
};

// ── Image ────────────────────────────────────────────────
export const resizeImage = (file, width, height, paymentIntentId = null) => {
  const form = new FormData();
  form.append('file', file);
  form.append('width', width);
  form.append('height', height);
  if (paymentIntentId) form.append('paymentIntentId', paymentIntentId);
  return API.post('/api/image/resize', form, { responseType: 'blob' });
};
