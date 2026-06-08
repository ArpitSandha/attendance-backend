const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const prisma = require('../config/db');
const {
  validateSignup,
  validateLogin
} = require('../validators/studentValidator');

// signup
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { name, password, email, rollNo, department, semester, section } = req.body;
    // check existing
    const existing = await prisma.student.findFirst({
      where: {
        OR: [
          { email },
          { rollNo }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email or Roll Number already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // create student
    const student = await prisma.student.create({
      data: {
        name,
        email,
        password: hashedPassword,
        rollNo,
        department,
        semester,
        section
      }
    });

    delete student.password;

    res.status(201).json({
      success: true,
      data: student
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await prisma.student.findUnique({
      where: { email },
      include: { devices: true }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // password verification
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: student.id,
        email: student.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    // Remove password from response
    delete student.password;

    // first login → register device
  //   if (student.devices.length === 0) {
  //     await prisma.device.create({
  //       data: {
  //         uuid,
  //         deviceHash,
  //         studentId: student.id
  //       }
  //     });

  //     return res.json({
  //       success: true,
  //       message: "Device registered",
  //       token,
  //       data: student
  //     });
  //   }

  //   // validate device
  //   const validDevice = student.devices.find(
  //     d => d.uuid === uuid && d.deviceHash === deviceHash
  //   );

  //   if (!validDevice) {

  // // check if pending request already exists
  // const pendingDevice = await prisma.device.findFirst({
  //   where: {
  //     uuid,
  //     deviceHash,
  //     studentId: student.id
  //   }
  // });

  // // create pending request
  // if (!pendingDevice) {

  //   await prisma.device.create({
  //     data: {
  //       uuid,
  //       deviceHash,
  //       studentId: student.id,
  //       isApproved: false,
  //       isActive: false
  //     }
  //   });

  // }

  // return res.status(403).json({
  //   success: false,
  //   message: "New device request submitted for approval"
  // });
  //   }

    res.json({
      success: true,
      message: "Login successful",
      token,
      data: student
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;