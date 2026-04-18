const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (allowedExts) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`));
  }
};

const uploadPdf = multer({
  storage,
  fileFilter: fileFilter(['.pdf']),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadWord = multer({
  storage,
  fileFilter: fileFilter(['.docx', '.doc']),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadImage = multer({
  storage,
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png', '.webp']),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const uploadMultiplePdf = multer({
  storage,
  fileFilter: fileFilter(['.pdf']),
  limits: { fileSize: 100 * 1024 * 1024 },
});

module.exports = { uploadPdf, uploadWord, uploadImage, uploadMultiplePdf };
