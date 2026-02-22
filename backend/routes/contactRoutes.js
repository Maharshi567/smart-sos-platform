const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { getContacts, addContact, deleteContact } = require('../controllers/contactController');

router.get('/', auth, getContacts);
router.post('/', auth, addContact);
router.delete('/:id', auth, deleteContact);

module.exports = router;