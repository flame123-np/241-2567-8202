// กำหนด URL สำหรับเรียก API
const BASE_URL = 'http://localhost:3000/api/attendance';

// กำหนดโหมดการทำงาน (CREATE สำหรับเพิ่มใหม่, EDIT สำหรับแก้ไข)
let mode = 'CREATE';
let selectId = '';

// ฟังก์ชันแปลงวันที่ให้อยู่ในรูปแบบที่ input type="date" ใช้ได้ (YYYY-MM-DD)
const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ''; // ถ้าไม่สามารถแปลงเป็นวันที่ได้ ให้คืนค่าว่าง
    return date.toISOString().split('T')[0]; // คืนวันที่ในรูปแบบ YYYY-MM-DD
};

// ฟังก์ชันตรวจสอบข้อมูลว่าครบถ้วนหรือไม่
const validateData = (attendanceData) => {
    let errors = [];
    if (!attendanceData.employee_id) errors.push('กรุณากรอกรหัสพนักงาน');
    if (!attendanceData.date) errors.push('กรุณากรอกวันที่');
    if (!attendanceData.time_in) errors.push('กรุณากรอกเวลาเข้า');
    if (!attendanceData.time_out) errors.push('กรุณากรอกเวลาออก');
    return errors;
};

// เมื่อหน้าเว็บโหลดเสร็จ (DOMContentLoaded) จะเริ่มทำงาน
document.addEventListener('DOMContentLoaded', async () => {
    const id = getIdFromUrl(); // ดึงค่า ID จาก URL ถ้ามี

    if (id) {
        mode = 'EDIT'; // ถ้ามี ID แสดงว่าอยู่ในโหมดแก้ไข
        selectId = id;

        try {
            // ดึงข้อมูลการเข้าออกงานจาก API ด้วย ID ที่ได้
            const response = await axios.get(`${BASE_URL}/${id}`);
            const attendance = response.data;

            // ใส่ข้อมูลที่ได้จากเซิร์ฟเวอร์ลงในฟอร์ม
            document.querySelector('input[name=employee_id]').value = attendance.employee_id;
            document.querySelector('input[name=date]').value = formatDate(attendance.date); // แปลงวันที่ให้รองรับ input type="date"
            document.querySelector('input[name=time_in]').value = attendance.time_in;
            document.querySelector('input[name=time_out]').value = attendance.time_out;
        } catch (error) {
            console.log('Error loading attendance data:', error);
        }
    }

    // ผูก event กับปุ่ม submit
    document.getElementById('submitBtn').addEventListener('click', submitData);
});

// ฟังก์ชันสำหรับตรวจสอบข้อมูลและส่งไปยังเซิร์ฟเวอร์
const submitData = async () => {
    // ดึงค่าจากฟอร์ม
    let employeeIdDom = document.querySelector('input[name=employee_id]');
    let dateDom = document.querySelector('input[name=date]');
    let timeInDom = document.querySelector('input[name=time_in]');
    let timeOutDom = document.querySelector('input[name=time_out]');
    let messageDOM = document.getElementById('message');

    // สร้างอ็อบเจกต์ข้อมูลที่จะส่ง
    let attendanceData = {
        employee_id: employeeIdDom.value,
        date: dateDom.value,
        time_in: timeInDom.value,
        time_out: timeOutDom.value
    };

    console.log('submitData', attendanceData);

    // ตรวจสอบข้อมูลก่อนส่ง ถ้าไม่ครบจะแสดงข้อความแจ้งเตือน
    const errors = validateData(attendanceData);
    if (errors.length > 0) {
        messageDOM.innerHTML = `<div>กรุณากรอกข้อมูลให้ครบถ้วน</div><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`;
        messageDOM.className = 'message danger';
        return;
    }

    try {
        let message = 'บันทึกข้อมูลการเข้าออกเรียบร้อย';
        let response;

        if (mode === 'CREATE') {
            // ถ้าอยู่ในโหมด CREATE ให้ใช้ POST
            response = await axios.post(BASE_URL, attendanceData);
        } else {
            // ถ้าอยู่ในโหมด EDIT ให้ใช้ PUT
            response = await axios.put(`${BASE_URL}/${selectId}`, attendanceData);
            message = 'แก้ไขข้อมูลการเข้าออกเรียบร้อย';
        }

        console.log('response', response.data);

        // แสดงข้อความสำเร็จ
        messageDOM.innerText = message;
        messageDOM.className = 'message success';
    } catch (error) {
        console.log('error message', error.message);
        messageDOM.innerHTML = `<div>เกิดข้อผิดพลาด: ${error.message}</div>`;
        messageDOM.className = 'message danger';
    }
};

// ฟังก์ชันดึงค่า ID จาก URL (ใช้ในโหมดแก้ไข)
const getIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};
