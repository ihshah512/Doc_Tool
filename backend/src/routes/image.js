const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { uploadImage } = require('../middleware/upload');
const { getImageResizePrice, formatPrice } = require('../services/pricing');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function scheduleCleanup(...files) {
  setTimeout(() => {
    files.forEach((f) => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (_) {} });
  }, 60000);
}

// POST /api/image/resize
// Body fields: width (px), height (px), paymentIntentId (after payment)
router.post('/resize', uploadImage.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const width = parseInt(req.body.width);
  const height = parseInt(req.body.height);

  if (!width || !height || width < 1 || height < 1) {
    return res.status(400).json({ error: 'Provide valid width and height in pixels' });
  }

  const price = getImageResizePrice();
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return res.json({
      requiresPayment: true,
      price,
      priceDisplay: formatPrice(price),
      fileId: req.file.filename,
      width,
      height,
    });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(402).json({ error: 'Payment not completed' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '') || 'jpeg';
    const outputPath = path.join(
      path.dirname(req.file.path),
      `resized_${Date.now()}.${ext}`
    );

    await sharp(req.file.path).resize(width, height, { fit: 'fill' }).toFile(outputPath);

    scheduleCleanup(req.file.path, outputPath);
    res.download(outputPath, `resized_${width}x${height}.${ext}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
