const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { uploadMultiplePdf } = require('../middleware/upload');
const { getMergePrice, formatPrice } = require('../services/pricing');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function getTotalPageCount(filePaths) {
  let total = 0;
  for (const fp of filePaths) {
    const bytes = fs.readFileSync(fp);
    const doc = await PDFDocument.load(bytes);
    total += doc.getPageCount();
  }
  return total;
}

async function mergePdfFiles(filePaths, outputPath) {
  const merged = await PDFDocument.create();
  for (const fp of filePaths) {
    const bytes = fs.readFileSync(fp);
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  const mergedBytes = await merged.save();
  fs.writeFileSync(outputPath, mergedBytes);
}

function scheduleCleanup(...files) {
  setTimeout(() => {
    files.forEach((f) => {
      try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {}
    });
  }, 60000);
}

// POST /api/merge/pdfs
router.post('/pdfs', uploadMultiplePdf.array('files', 20), async (req, res) => {
  if (!req.files || req.files.length < 2) {
    return res.status(400).json({ error: 'Please upload at least 2 PDF files' });
  }

  const filePaths = req.files.map((f) => f.path);

  try {
    const totalPages = await getTotalPageCount(filePaths);
    const price = getMergePrice(totalPages);

    if (price > 0) {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        return res.json({
          requiresPayment: true,
          totalPages,
          fileCount: req.files.length,
          price,
          priceDisplay: formatPrice(price),
          fileIds: req.files.map((f) => f.filename),
        });
      }
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== 'succeeded') {
        return res.status(402).json({ error: 'Payment not completed' });
      }
    }

    const outputPath = path.join(path.dirname(filePaths[0]), `merged_${Date.now()}.pdf`);
    await mergePdfFiles(filePaths, outputPath);

    scheduleCleanup(...filePaths, outputPath);
    res.download(outputPath, `merged_${Date.now()}.pdf`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
