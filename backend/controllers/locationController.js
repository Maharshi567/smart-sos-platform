const Location = require('../models/Location');

exports.saveLocation = async (req, res) => {
  try {
    const location = await Location.create({ ...req.body, userId: req.user.id });
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.user.id }).sort({ timestamp: -1 }).limit(50);
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};