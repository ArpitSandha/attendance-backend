require('dotenv').config();

const studentRoutes = require('./routes/studentRoutes');
const express = require('express');
const cors = require('cors');
const prisma = require('./config/db');
const sessionRoutes = require('./routes/sessionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use('/student', studentRoutes);
app.use('/session', sessionRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/report', reportRoutes);
app.use('/teacher', teacherRoutes);

app.get('/test-db', async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Attendance Backend Running'
  });
});

async function testDB() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL Connected Successfully");
  } catch (err) {
    console.error("Database Connection Failed");
    console.error(err);
  }
}

testDB();

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Backend Running'
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server started on port ${process.env.PORT || 5000}`);
});

