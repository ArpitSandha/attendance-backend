const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/mark', authMiddleware, async (req, res) => {
  try {
    const { email, uuid, deviceHash } = req.body;

    // 1. find student
    const student = await prisma.student.findUnique({
      where: { email },
      include: { devices: true }
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. validate device
    const validDevice = student.devices.find(
      d => d.uuid === uuid && d.deviceHash === deviceHash
    );

    if (!validDevice) {
      return res.status(403).json({ message: "Invalid device" });
    }

    // 3. find active session
    const now = new Date();

    const session = await prisma.session.findFirst({
      where: {
        startTime: { lte: now },
        endTime: { gte: now }
      }
    });

    if (!session) {
      return res.status(400).json({ message: "No active session" });
    }

    // 4. check already marked
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_sessionId: {
          studentId: student.id,
          sessionId: session.id
        }
      }
    });

    if (existing) {
      return res.json({ message: "Attendance already marked" });
    }

    // 5. mark attendance
    const attendance = await prisma.attendance.create({
      data: {
        studentId: student.id,
        sessionId: session.id,
        status: "present"
      }
    });

    res.json({ message: "Attendance marked", attendance });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;