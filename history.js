// เมื่อหน้าเว็บโหลดเสร็จ (DOMContentLoaded) จะเริ่มโหลดข้อมูลทั้งสองประเภท (attendance และ leave)
window.addEventListener('DOMContentLoaded', async () => {
    await loadData('attendance'); // โหลดข้อมูลการเข้าออกงาน
    await loadData('leave'); // โหลดข้อมูลการลา
});

// ฟังก์ชันแปลงวันที่ให้อยู่ในรูปแบบ วัน/เดือน/ปี (ในกรณีของประเทศไทย)
const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
        return "Invalid Date"; // ถ้าไม่สามารถแปลงวันที่ได้ คืนค่าเป็น "Invalid Date"
    }
    return date.toLocaleDateString('th-TH'); // แสดงวันที่ในรูปแบบ วัน/เดือน/ปี
}

// ฟังก์ชันหลักในการโหลดข้อมูลจาก API
const loadData = async (type) => {
    console.log(`${type} page loaded`);

    // กำหนด URL ตามประเภทข้อมูลที่ต้องการ (ลา หรือ เวลาการเข้าออกงาน)
    const baseUrl = type === 'leave'
        ? 'http://localhost:3000/api/leave_requests'  // API สำหรับข้อมูลการลา
        : 'http://localhost:3000/api/attendance';     // API สำหรับข้อมูลการเข้าออกงาน

    // เลือก element ที่จะใช้แสดงตารางข้อมูล
    const tableDOM = document.getElementById(type === 'leave' ? 'leave-requests' : 'attendance');

    // ถ้าไม่พบตารางใน DOM จะหยุดทำงาน
    if (!tableDOM) {
        console.log(`Table DOM for ${type} not found!`);
        return;
    }

    // ดึงข้อมูลจาก API
    const response = await axios.get(baseUrl);
    console.log(response.data);

    // เริ่มสร้าง HTML ของตาราง
    let htmlData = `
    <table border="1" cellspacing="1" cellpadding="10">
        <thead>
            <tr>
                <th>ID</th>
                <th>Employee ID</th>
                <th>${type === 'leave' ? 'Start Date' : 'Date'}</th>
                <th>${type === 'leave' ? 'End Date' : 'Time In'}</th>
                <th>${type === 'leave' ? 'Leave Type' : 'Time Out'}</th>
                ${type === 'leave' ? '<th>Reason</th>' : ''}
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
    `;

    // แสดงข้อมูลในแต่ละแถว
    for (let i = 0; i < response.data.length; i++) {
        let record = response.data[i];

        // เพิ่มแถวของข้อมูลที่ดึงมาจาก API ลงในตาราง
        htmlData += `
        <tr>
            <td>${record.id}</td>
            <td>${record.employee_id}</td>
            <td>${type === 'leave' ? formatDate(record.start_date) : formatDate(record.date)}</td>
            <td>${type === 'leave' ? formatDate(record.end_date) : (record.time_in || '-')}</td>
            <td>${type === 'leave' ? record.leave_type : (record.time_out || '-')}</td>
            ${type === 'leave' ? `<td>${record.reason || '-'}</td>` : ''}
            <td>
                <a href="${type}.html?id=${record.id}"><button class='Edit'>Edit</button></a>
                <button class="delete" data-id="${record.id}" data-type="${type}">Delete</button>
            </td>
        </tr>
        `;
    }

    htmlData += `
        </tbody>
    </table>
    `;

    // ใส่ HTML ที่สร้างขึ้นในตาราง DOM
    tableDOM.innerHTML = htmlData;

    // เพิ่ม event listener สำหรับปุ่มลบในแต่ละแถวของตาราง
    const deleteDOMs = document.getElementsByClassName('delete');
    for (let i = 0; i < deleteDOMs.length; i++) {
        deleteDOMs[i].addEventListener('click', async (event) => {
            const id = event.target.dataset.id;  // รับค่า ID ของข้อมูลที่ต้องการลบ
            const type = event.target.dataset.type; // รับประเภทของข้อมูล (ลา หรือ การเข้าออกงาน)

            // กำหนด URL สำหรับการลบข้อมูลตามประเภท
            const baseUrl = type === 'leave'
                ? 'http://localhost:3000/api/leave_requests'
                : 'http://localhost:3000/api/attendance';

            try {
                // ลบข้อมูลจาก API
                await axios.delete(`${baseUrl}/${id}`);
                loadData(type);  // รีโหลดข้อมูลหลังจากลบ
            } catch (error) {
                console.log('error', error);  // แสดงข้อผิดพลาดหากมี
            }
        });
    }
};
