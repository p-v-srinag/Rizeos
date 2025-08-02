const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  // Regex to check for common image, video, document, and audio file types
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|mp3|wav/;
  
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Invalid file type! Please upload a valid file.');
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Increased limit to 100MB for video/docs
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});

module.exports = upload;