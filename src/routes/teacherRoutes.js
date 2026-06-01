const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const prisma = require('../config/db');


// ======================
// TEACHER SIGNUP
// ======================

router.post('/signup', async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      department
    } = req.body;

    const existing = await prisma.teacher.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Teacher already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department
      }
    });

    delete teacher.password;

    res.status(201).json({
      success: true,
      message: "Teacher registered successfully",
      data: teacher
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});


// ======================
// TEACHER LOGIN
// ======================

router.post('/login', async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      teacher.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: teacher.id,
        email: teacher.email,
        role: teacher.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    delete teacher.password;

    res.json({
      success: true,
      message: "Teacher login successful",
      token,
      data: teacher
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

// ======================
// VIEW SESSION ATTENDANCE
// ======================

router.get('/session/:sessionId', async (req, res) => {

  try {

    const sessionId = parseInt(req.params.sessionId);

    const session = await prisma.session.findUnique({

      where: {
        id: sessionId
      },

      include: {

        attendance: {

          include: {
            student: true
          }

        }

      }

    });

    if (!session) {

      return res.status(404).json({
        success: false,
        message: "Session not found"
      });

    }

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

// ======================
// VIEW PENDING DEVICES
// ======================

router.get('/pending-devices', async (req, res) => {

  try {

    const devices = await prisma.device.findMany({

      where: {
        isApproved: false
      },

      include: {
        student: true
      }

    });

    res.json({
      success: true,
      total: devices.length,
      data: devices
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

// ======================
// APPROVE DEVICE
// ======================

router.post('/approve-device/:deviceId', async (req, res) => {

  try {

    const deviceId = parseInt(req.params.deviceId);

    const device = await prisma.device.update({

      where: {
        id: deviceId
      },

      data: {
        isApproved: true,
        isActive: true
      }

    });

    res.json({
      success: true,
      message: "Device approved successfully",
      data: device
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

});

module.exports = router;