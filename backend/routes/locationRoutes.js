const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { saveLocation, getLocations } = require('../controllers/locationController');

router.post('/', auth, saveLocation);
router.get('/', auth, getLocations);

module.exports = router;