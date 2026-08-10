const multer = require('multer');

const storage = multer.memoryStorage(); // optional: no local saving
const upload = multer({ storage });

module.exports = upload;
