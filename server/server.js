// นำเข้าไลบรารีที่ใช้ในโปรเจกต์
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

// สร้าง instance ของ Express
const app = express();

// กำหนดพอร์ตที่ใช้งาน
const port = 3000;

// กำหนดให้แอพรับข้อมูลในรูปแบบ JSON และเปิดใช้งาน CORS
app.use(bodyParser.json());
app.use(cors());

let conn = null; // การเชื่อมต่อฐานข้อมูล

// ฟังก์ชันสำหรับการเชื่อมต่อ MySQL
const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: 'localhost',  // ชื่อโฮสต์ฐานข้อมูล
    user: 'root',       // ชื่อผู้ใช้ฐานข้อมูล
    password: 'root',   // รหัสผ่านฐานข้อมูล
    database: 'webdb',  // ชื่อฐานข้อมูล
    port: 8840,         // พอร์ตของฐานข้อมูล
  });
};

// ฟังก์ชันตรวจสอบข้อมูลการเข้าออกงาน
const validateAttendanceData = (attendanceData) => {
  let errors = [];
  if (!attendanceData.employee_id) errors.push('กรุณากรอกรหัสพนักงาน');
  if (!attendanceData.date) errors.push('กรุณากรอกวันที่');
  if (!attendanceData.time_in) errors.push('กรุณากรอกเวลาเข้า');
  if (!attendanceData.time_out) errors.push('กรุณากรอกเวลาออก');
  return errors;
};

// ฟังก์ชันตรวจสอบข้อมูลคำขอลา
const validateLeaveData = (leaveData) => {
  let errors = [];
  if (!leaveData.employee_id) errors.push('กรุณากรอกรหัสพนักงาน');
  if (!leaveData.start_date) errors.push('กรุณากรอกวันที่เริ่มลา');
  if (!leaveData.end_date) errors.push('กรุณากรอกวันที่สิ้นสุดลา');
  if (!leaveData.leave_type) errors.push('กรุณากรอกประเภทการลา');
  if (!leaveData.reason) errors.push('กรุณากรอกเหตุผลการลา');
  return errors;
};

// ===================== API สำหรับ Attendance =====================

// GET: ดึงข้อมูล attendance ทั้งหมด
app.get('/api/attendance', async (req, res) => {
  const results = await conn.query('SELECT * FROM `attendance`');
  res.json(results[0]);
});

// GET: ดึงข้อมูล attendance ตาม ID
app.get('/api/attendance/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const results = await conn.query('SELECT * FROM `attendance` WHERE id = ?', [id]);
    if (results[0].length > 0) {
      res.json(results[0][0]);
    } else {
      res.status(404).json({ message: "Attendance not found" });
    }
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

// POST: สร้างข้อมูล attendance ใหม่
app.post('/api/attendance', async (req, res) => {
  try {
    let attendance = req.body;

    // ตรวจสอบข้อมูลการเข้าออกงาน
    const errors = validateAttendanceData(attendance);
    if (errors.length > 0) {
      throw {
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        errors: errors
      };
    }

    // บันทึกข้อมูลลงฐานข้อมูล
    const results = await conn.query('INSERT INTO `attendance` SET ?', attendance);
    res.json({
      message: "Create attendance successfully",
      data: results[0]
    });
  } catch (error) {
    const errorMessages = error.message || 'Something went wrong';
    const errors = error.errors || [];
    console.error('error message:', error.message);
    res.status(500).json({
      message: errorMessages,
      errors: errors
    });
  }
});

// PUT: แก้ไขข้อมูล attendance ตาม ID
app.put('/api/attendance/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let updatedAttendance = req.body;

    // อัปเดตข้อมูลการเข้าออกงาน
    const results = await conn.query(
      'UPDATE `attendance` SET ? WHERE id = ?',
      [updatedAttendance, id]
    );
    res.json({
      message: "Update attendance successfully",
      data: results[0]
    });
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

// DELETE: ลบข้อมูล attendance ตาม ID
app.delete('/api/attendance/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query('DELETE FROM `attendance` WHERE id = ?', id);
    res.json({
      message: "Delete attendance successfully",
      data: results[0]
    });
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

// ===================== API สำหรับ Leave Requests =====================

// GET: ดึงข้อมูล leave_requests ทั้งหมด
app.get('/api/leave_requests', async (req, res) => {
  const results = await conn.query('SELECT * FROM `leave_requests`');
  res.json(results[0]);
});

// GET: ดึงข้อมูล leave_requests ตาม ID
app.get('/api/leave_requests/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const results = await conn.query('SELECT * FROM `leave_requests` WHERE id = ?', [id]);
    if (results[0].length > 0) {
      res.json(results[0][0]);
    } else {
      res.status(404).json({ message: "Leave request not found" });
    }
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

// POST: สร้างข้อมูล leave_requests ใหม่
app.post('/api/leave_requests', async (req, res) => {
  try {
    let leaveRequest = req.body;

    // ตรวจสอบข้อมูลการขอลา
    const errors = validateLeaveData(leaveRequest);
    if (errors.length > 0) {
      throw {
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        errors: errors
      };
    }

    // บันทึกข้อมูลการขอลา
    const results = await conn.query('INSERT INTO `leave_requests` SET ?', leaveRequest);
    res.json({
      message: "Create leave request successfully",
      data: results[0]
    });
  } catch (error) {
    const errorMessages = error.message || 'Something went wrong';
    const errors = error.errors || [];
    console.error('error message:', error.message);
    res.status(500).json({
      message: errorMessages,
      errors: errors
    });
  }
});

// PUT: แก้ไขข้อมูล leave_requests ตาม ID
app.put('/api/leave_requests/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let updatedLeaveRequest = req.body;

    // อัปเดตข้อมูลการขอลา
    const results = await conn.query(
      'UPDATE `leave_requests` SET ? WHERE id = ?',
      [updatedLeaveRequest, id]
    );
    res.json({
      message: "Update leave request successfully",
      data: results[0]
    });
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

// DELETE: ลบข้อมูล leave_requests ตาม ID
app.delete('/api/leave_requests/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const results = await conn.query('DELETE FROM `leave_requests` WHERE id = ?', id);
    res.json({
      message: "Delete leave request successfully",
      data: results[0]
    });
  } catch (error) {
    console.error('error:', error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, async () => {
  await initMySQL();
  console.log('http server is running on port ' + port);
});
