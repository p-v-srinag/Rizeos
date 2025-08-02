const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  // Regex to check for common image, video, and PDF file types
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf/;
  
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Invalid file type! Only images, videos, and PDFs are allowed.');
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});

module.exports = upload;