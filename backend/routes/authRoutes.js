const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

const otpStore = {};

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = { otp, expiry: Date.now() + 10 * 60 * 1000 };

    // Return OTP to frontend — frontend opens WhatsApp
    res.json({ success: true, otp });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const stored = otpStore[phone];

    if (!stored) return res.status(400).json({ error: 'OTP not found. Request new OTP.' });
    if (Date.now() > stored.expiry) {
      delete otpStore[phone];
      return res.status(400).json({ error: 'OTP expired. Request new OTP.' });
    }
    if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP!' });

    delete otpStore[phone];
    res.json({ success: true, message: 'Phone verified!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;