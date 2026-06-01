const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

// STUDENT ATTENDANCE REPORT
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);

    // total sessions
    const totalSessions = await prisma.session.count();

    // attended sessions
    const attended = await prisma.attendance.count({
      where: {
        studentId
      }
    });

    // percentage
    const percentage =
      totalSessions === 0
        ? 0
        : ((attended / totalSessions) * 100).toFixed(2);

    // low attendance check
    const lowAttendance = percentage < 75;

    res.json({
      success: true,
      data: {
        studentId,
        totalSessions,
        attended,
        percentage,
        lowAttendance
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// LOW ATTENDANCE STUDENTS
// =========================
router.get('/low-attendance', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        attendance: true
      }
    });

    const totalSessions = await prisma.session.count();

    const report = students.map(student => {
      const attended = student.attendance.length;

      const percentage =
        totalSessions === 0
          ? 0
          : ((attended / totalSessions) * 100);

      return {
        id: student.id,
        name: student.name,
        rollNo: student.rollNo,
        email: student.email,
        percentage: percentage.toFixed(2),
        lowAttendance: percentage < 75
      };
    });

    // only low attendance students
    const filtered = report.filter(
      s => s.lowAttendance
    );

    if (filtered.length === 0) {
      return res.json({
        success: true,
        message: "No students with low attendance",
        totalStudents: 0,
        data: []
      });
    }

    res.json({
      success: true,
      totalStudents: filtered.length,
      data: filtered
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;