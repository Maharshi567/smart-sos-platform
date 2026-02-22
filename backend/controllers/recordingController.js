const Recording = require('../models/Recording');

exports.saveRecording = async (req, res) => {
  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    const recording = await Recording.create({
      userId: req.user.id,
      emergencyId: req.body.emergencyId,
      type: req.body.type,
      fileUrl
    });
    res.status(201).json(recording);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecordings = async (req, res) => {
  try {
    const recordings = await Recording.find({ userId: req.user.id });
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};