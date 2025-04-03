// กำหนด URL สำหรับเรียก API
const BASE_URL = 'http://localhost:3000/api/leave_requests';

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
const validateData = (leaveData) => {
    let errors = [];
    if (!leaveData.employee_id) errors.push('กรุณากรอก Employee ID');
    if (!leaveData.start_date) errors.push('กรุณากรอกวันที่เริ่มลา');
    if (!leaveData.end_date) errors.push('กรุณากรอกวันที่สิ้นสุดลา');
    if (!leaveData.leave_type) errors.push('กรุณากรอกประเภทการลา');
    if (!leaveData.reason) errors.push('กรุณากรอกเหตุผลการลา');
    return errors;
};

// รอจนหน้าเว็บโหลดเสร็จ จึงเริ่มทำงาน
document.addEventListener('DOMContentLoaded', async () => {
    const id = getIdFromUrl(); // ดึง ID จาก URL ถ้ามี

    if (id) {
        mode = 'EDIT'; // ถ้ามี ID แสดงว่าอยู่ในโหมดแก้ไข
        selectId = id;

        try {
            // ดึงข้อมูลคำขอลาจาก API ด้วย ID ที่ได้
            const response = await axios.get(`${BASE_URL}/${id}`);
            const leave = response.data;

            // ใส่ข้อมูลที่ได้จากเซิร์ฟเวอร์ลงในฟอร์ม
            document.querySelector('input[name=employee_id]').value = leave.employee_id;
            document.querySelector('select[name=leave_type]').value = leave.leave_type;
            document.querySelector('textarea[name=reason]').value = leave.reason;
            document.querySelector('input[name=start_date]').value = formatDate(leave.start_date);
            document.querySelector('input[name=end_date]').value = formatDate(leave.end_date);
        } catch (error) {
            console.log('Error loading leave data:', error);
        }
    }

    // ผูก event กับปุ่ม submit
    document.getElementById('submitBtn').addEventListener('click', submitData);
});

// ฟังก์ชันสำหรับส่งข้อมูลไปยังเซิร์ฟเวอร์
const submitData = async () => {
    // ดึงค่าจากฟอร์ม
    let employeeIdDom = document.querySelector('input[name=employee_id]');
    let startDateDom = document.querySelector('input[name=start_date]');
    let endDateDom = document.querySelector('input[name=end_date]');
    let leaveTypeDom = document.querySelector('select[name=leave_type]');
    let reasonDom = document.querySelector('textarea[name=reason]');
    let messageDOM = document.getElementById('message');

    // สร้างอ็อบเจกต์ข้อมูลที่จะส่ง
    let leaveData = {
        employee_id: employeeIdDom.value,
        start_date: startDateDom.value,
        end_date: endDateDom.value,
        leave_type: leaveTypeDom.value,
        reason: reasonDom.value
    };

    console.log('submitData', leaveData);

    // ตรวจสอบข้อมูลก่อนส่ง ถ้าไม่ครบจะแสดงข้อความแจ้งเตือน
    const errors = validateData(leaveData);
    if (errors.length > 0) {
        messageDOM.innerHTML = `<div>กรุณากรอกข้อมูลให้ครบถ้วน</div><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`;
        messageDOM.className = 'message danger';
        return;
    }

    try {
        let message = 'บันทึกคำขอลาเรียบร้อย';
        let response;

        if (mode === 'CREATE') {
            // ถ้าอยู่ในโหมด CREATE ให้ใช้ POST
            response = await axios.post(BASE_URL, leaveData);
        } else {
            // ถ้าอยู่ในโหมด EDIT ให้ใช้ PUT
            response = await axios.put(`${BASE_URL}/${selectId}`, leaveData);
            message = 'แก้ไขคำขอลาเรียบร้อย';
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

// ฟังก์ชันดึง ID จาก URL (ใช้ในโหมดแก้ไข)
const getIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};
