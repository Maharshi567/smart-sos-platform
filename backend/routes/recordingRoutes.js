const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const { saveRecording, getRecordings } = require('../controllers/recordingController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/', auth, upload.single('file'), saveRecording);
router.get('/', auth, getRecordings);

module.exports = router;