const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { uploadPdf, uploadWord } = require('../middleware/upload');
const { convertWithLibreOffice } = require('../services/libreoffice');
const { getConversionPrice, formatPrice } = require('../services/pricing');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

    if (price > 0) {
      // Paid: require a Stripe paymentIntentId
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
      // Verify payment succeeded
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== 'succeeded') {
        return res.status(402).json({ error: 'Payment not completed' });
      }
    }

    const outputDir = path.dirname(req.file.path);
    const outputPath = await convertWithLibreOffice(req.file.path, 'docx', outputDir);
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
    // Convert to PDF first to count pages
    const pdfPath = await convertWithLibreOffice(req.file.path, 'pdf', outputDir);
    const pageCount = await getPdfPageCount(pdfPath);
    const price = getConversionPrice(pageCount);

    if (price > 0) {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        scheduleCleanup(pdfPath); // clean up intermediate
        return res.json({
          requiresPayment: true,
          pageCount,
          price,
          priceDisplay: formatPrice(price),
          fileId: req.file.filename,
        });
      }
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== 'succeeded') {
        return res.status(402).json({ error: 'Payment not completed' });
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
