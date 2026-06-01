const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// create session (manual for now)
router.post('/create', async (req, res) => {

  try {

    const {
      subjectName,
      room,
      startTime,
      endTime
    } = req.body;

    const session = await prisma.session.create({
      data: {
        subjectName,
        room,
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      }
    });

    res.json({
      success: true,
      data: session
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

// get active session
router.get('/active', async (req, res) => {
  try {
    const now = new Date();

    const session = await prisma.session.findFirst({
      where: {
        startTime: { lte: now },
        endTime: { gte: now }
      }
    });

    if (!session) {
      return res.json({ message: "No active session" });
    }

    res.json(session);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;