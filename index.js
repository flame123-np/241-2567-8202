// เพิ่ม event listener เมื่อผู้ใช้คลิกปุ่มค้นหา
document.getElementById('search-btn').addEventListener('click', function() {
    
    // ดึงค่าที่ผู้ใช้พิมพ์ในช่องค้นหา และแปลงเป็นตัวพิมพ์เล็ก
    const searchInput = document.getElementById('search-input').value.trim().toLowerCase();

    // อ้างอิงถึง element ที่จะแสดงผลลัพธ์การค้นหา
    const searchResults = document.getElementById('search-results');

    // ข้อมูลตัวอย่างที่ใช้ในการค้นหา (เช่น บทความหรือหัวข้อ)
    const data = [
        { title: 'การลงเวลางาน', content: 'วิธีการลงเวลาทำงานในระบบ', link: 'attendance.html' },
        { title: 'การขอลางาน', content: 'คำแนะนำเกี่ยวกับการขอลางาน', link: 'leave.html' },
        { title: 'ประวัติการทำงานและการลา', content: 'วิธีการดูประวัติการทำงาน', link: 'history.html' }
    ];

    // กรองข้อมูลเพื่อหาที่ตรงกับคำค้น ทั้งใน title และ content
    const results = data.filter(item => 
        item.title.toLowerCase().includes(searchInput) || item.content.toLowerCase().includes(searchInput)
    );

    // ถ้าช่องค้นหาว่าง จะไม่แสดงอะไร
    if (searchInput === '') {
        searchResults.innerHTML = '';
    } 
    // ถ้ามีผลลัพธ์จากการค้นหา
    else if (results.length > 0) {
        searchResults.innerHTML = results.map(item => 
            // สร้าง HTML แสดงผลลัพธ์แต่ละรายการ
            `<div class="result-item">
                <a href="${item.link}">${item.title}</a>
                <p>${item.content}</p>
            </div>`
        ).join('');
    } 
    // ถ้าไม่เจอผลลัพธ์เลย
    else {
        searchResults.innerHTML = '<p>ไม่พบผลลัพธ์</p>';
    }
});
