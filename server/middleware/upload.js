const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Invalid file type! Only images, videos, and PDFs are allowed.');
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});

module.exports = upload;
