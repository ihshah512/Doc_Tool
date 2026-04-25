const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { uploadPdf, uploadWord } = require('../middleware/upload');
const { convertFile } = require('../services/converter');
const { getConversionPrice, formatPrice } = require('../services/pricing');
const { verifyPayment, isConfigured } = require('../services/stripeHelper');

// Helper: count pages in a PDF
async function getPdfPageCount(filePath) {
  const bytes = fs.readFileSync(filePath);
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

// Helper: clean up temp files after a delay
function scheduleCleanup(...files) {
  setTimeout(() => {
    files.forEach((f) => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {} });
  }, 60000); // 1 min
}

// POST /api/convert/pdf-to-word
router.post('/pdf-to-word', uploadPdf.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const pageCount = await getPdfPageCount(req.file.path);
    const price = getConversionPrice(pageCount);

    if (price > 0 && isConfigured) {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        return res.json({
          requiresPayment: true,
          pageCount,
          price,
          priceDisplay: formatPrice(price),
          fileId: req.file.filename,
        });
      }
      const payment = await verifyPayment(paymentIntentId);
      if (!payment.ok) {
        return res.status(402).json({ error: payment.error });
      }
    }

    const outputDir = path.dirname(req.file.path);
    const outputPath = await convertFile(req.file.path, 'docx', outputDir);
    scheduleCleanup(req.file.path, outputPath);

    res.download(outputPath, `converted_${Date.now()}.docx`, () => {
      scheduleCleanup(outputPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/convert/word-to-pdf
router.post('/word-to-pdf', uploadWord.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const outputDir = path.dirname(req.file.path);
    const pdfPath = await convertFile(req.file.path, 'pdf', outputDir);
    const pageCount = await getPdfPageCount(pdfPath);
    const price = getConversionPrice(pageCount);

    if (price > 0 && isConfigured) {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        scheduleCleanup(pdfPath);
        return res.json({
          requiresPayment: true,
          pageCount,
          price,
          priceDisplay: formatPrice(price),
          fileId: req.file.filename,
        });
      }
      const payment = await verifyPayment(paymentIntentId);
      if (!payment.ok) {
        return res.status(402).json({ error: payment.error });
      }
    }

    scheduleCleanup(req.file.path, pdfPath);
    res.download(pdfPath, `converted_${Date.now()}.pdf`, () => {
      scheduleCleanup(pdfPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/convert/page-count  (used by frontend before payment)
router.post('/page-count', uploadPdf.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const pageCount = await getPdfPageCount(req.file.path);
    const price = getConversionPrice(pageCount);
    res.json({ pageCount, price, priceDisplay: formatPrice(price), fileId: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
