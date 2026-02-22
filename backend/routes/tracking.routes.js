const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Tracking = require("../models/Tracking"); // adjust path to match your project
const authMiddleware = require("../middleware/authMiddleware"); // your existing JWT middleware

// ============================================================
// POST /api/tracking/start
// Creates a new tracking session, returns trackingId
// ============================================================
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { lat, lng, duration, name } = req.body;

    // Validate inputs
    if (lat == null || lng == null) {
      return res.status(400).json({ error: "lat and lng are required" });
    }
    if (!duration || duration < 1 || duration > 8) {
      return res.status(400).json({ error: "duration must be between 1 and 8 hours" });
    }

    // Generate unique tracking ID
    const trackingId = crypto.randomBytes(16).toString("hex");

    // Calculate expiry
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

    // Create session in DB
    const session = await Tracking.create({
      trackingId,
      userId: req.user.id,
      name: name || req.user.name || "Someone",
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      duration,
      expiresAt,
      active: true,
      lastUpdated: new Date(),
    });

    return res.status(201).json({
      trackingId: session.trackingId,
      expiresAt: session.expiresAt,
      message: "Tracking session started",
    });
  } catch (err) {
    console.error("tracking/start error:", err);
    return res.status(500).json({ error: "Server error starting tracking session" });
  }
});

// ============================================================
// PATCH /api/tracking/:id
// Updates lat/lng every 30 seconds from the user's device
// ============================================================
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    const session = await Tracking.findOne({
      trackingId: req.params.id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ error: "Tracking session not found" });
    }

    // Check if session has expired
    if (new Date() > session.expiresAt || !session.active) {
      return res.status(410).json({ error: "Tracking session has expired" });
    }

    session.lat = parseFloat(lat);
    session.lng = parseFloat(lng);
    session.lastUpdated = new Date();
    await session.save();

    return res.json({
      success: true,
      lat: session.lat,
      lng: session.lng,
      lastUpdated: session.lastUpdated,
    });
  } catch (err) {
    console.error("tracking/update error:", err);
    return res.status(500).json({ error: "Server error updating location" });
  }
});

// ============================================================
// PATCH /api/tracking/:id/stop
// User manually stops sharing
// ============================================================
router.patch("/:id/stop", authMiddleware, async (req, res) => {
  try {
    const session = await Tracking.findOne({
      trackingId: req.params.id,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ error: "Tracking session not found" });
    }

    session.active = false;
    await session.save();

    return res.json({ success: true, message: "Tracking session stopped" });
  } catch (err) {
    console.error("tracking/stop error:", err);
    return res.status(500).json({ error: "Server error stopping session" });
  }
});

// ============================================================
// GET /api/tracking/:id
// PUBLIC route — anyone with the link can get current location
// ============================================================
router.get("/:id", async (req, res) => {
  try {
    const session = await Tracking.findOne({ trackingId: req.params.id }).select(
      "trackingId name lat lng expiresAt active lastUpdated duration"
    );

    if (!session) {
      return res.status(404).json({ error: "Tracking session not found or expired" });
    }

    // Check expiry
    if (new Date() > session.expiresAt || !session.active) {
      return res.status(410).json({
        error: "This tracking link has expired or been stopped",
        expired: true,
      });
    }

    return res.json({
      trackingId: session.trackingId,
      name: session.name,
      lat: session.lat,
      lng: session.lng,
      expiresAt: session.expiresAt,
      lastUpdated: session.lastUpdated,
      active: session.active,
    });
  } catch (err) {
    console.error("tracking/get error:", err);
    return res.status(500).json({ error: "Server error fetching location" });
  }
});

module.exports = router;