const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { createEmergency, getEmergencies, resolveEmergency } = require('../controllers/emergencyController');

router.post('/', auth, createEmergency);
router.get('/', auth, getEmergencies);
router.put('/:id/resolve', auth, resolveEmergency);

module.exports = router;