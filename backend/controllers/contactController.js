const Contact = require('../models/Contact');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ userId: req.user.id });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addContact = async (req, res) => {
  try {
    const { name, phone, relation, email } = req.body;

    // ✅ Check duplicate phone number
    const existingPhone = await Contact.findOne({
      userId: req.user.id,
      phone: phone
    });
    if (existingPhone) {
      return res.status(400).json({
        message: 'A contact with this phone number already exists!'
      });
    }

    // ✅ Check duplicate email if provided
    if (email) {
      const existingEmail = await Contact.findOne({
        userId: req.user.id,
        email: email
      });
      if (existingEmail) {
        return res.status(400).json({
          message: 'A contact with this email already exists!'
        });
      }
    }

    // ✅ Check duplicate name
    const existingName = await Contact.findOne({
      userId: req.user.id,
      name: { $regex: new RegExp('^' + name + '$', 'i') }
    });
    if (existingName) {
      return res.status(400).json({
        message: 'A contact with this name already exists!'
      });
    }

    const contact = await Contact.create({
      name, phone, relation, email,
      userId: req.user.id
    });

    res.status(201).json(contact);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};