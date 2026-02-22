const Emergency = require('../models/Emergency');

exports.createEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.create({ ...req.body, userId: req.user.id });
    res.status(201).json(emergency);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved' },
      { new: true }
    );
    res.json(emergency);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};