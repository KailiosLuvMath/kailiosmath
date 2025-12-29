// File: darkmode.js
const themeBtn = document.getElementById('themeBtn');

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        themeBtn.innerText = "☀️";
        // Thay đổi màu biến CSS sang tông tối
        document.documentElement.style.setProperty('--glass-white', 'rgba(0, 0, 0, 0.6)');
        document.documentElement.style.setProperty('--text-main', '#ffffff');
        document.body.style.background = "linear-gradient(135deg, #2c3e50 0%, #000000 100%)";
    } else {
        themeBtn.innerText = "🌙";
        // Quay lại tông sáng
        document.documentElement.style.setProperty('--glass-white', 'rgba(255, 255, 255, 0.7)');
        document.documentElement.style.setProperty('--text-main', '#2f3640');
        document.body.style.background = "linear-gradient(135deg, #dff9fb 0%, #c7ecee 100%)";
    }
});
