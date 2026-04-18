/**
 * Pricing rules:
 * - PDF/Word conversion: 1st page free, $1 per additional page
 * - Image resize: $1 per file
 * - PDF merge: $1 per 5 pages (e.g. 10 pages = $2)
 */

function getConversionPrice(pageCount) {
  if (pageCount <= 1) return 0;
  return (pageCount - 1) * 100; // cents
}

function getImageResizePrice() {
  return 100; // $1 in cents
}

function getMergePrice(totalPages) {
  if (totalPages === 0) return 0;
  const units = Math.ceil(totalPages / 5);
  return units * 100; // $1 per 5 pages, in cents
}

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

module.exports = { getConversionPrice, getImageResizePrice, getMergePrice, formatPrice };
