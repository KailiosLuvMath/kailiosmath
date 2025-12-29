// 1. Hàm hiển thị thông báo Toast
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `✨ ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// 2. Vệ sĩ kiểm tra quyền Admin (Dùng hàm này để tái sử dụng cho gọn)
function checkAdminPrivilege() {
    return localStorage.getItem('isAdmin') === 'true';
}

// 3. Khởi tạo khi load trang (F5)
window.addEventListener('DOMContentLoaded', () => {
    const isAdmin = checkAdminPrivilege(); //
    const adminPanel = document.getElementById('adminPanel');

    if (isAdmin) {
        if (adminPanel) adminPanel.classList.remove('hidden'); //
        console.log("Xác nhận quyền Admin: Hoạt động");
    } else {
        if (adminPanel) adminPanel.classList.add('hidden'); // Đảm bảo ẩn nếu không phải admin
        localStorage.removeItem('isAdmin'); // Xóa sạch nếu giá trị bị sai
    }

    // Luôn load sidebar, hàm renderSidebar sẽ tự check isAdmin bên upload.js
    if (typeof renderSidebar === "function") {
        renderSidebar(); 
    }
});

// 4. Hàm Đăng nhập (Có lưu bộ nhớ)
function adminLogin() {
    const pass = prompt("Nhập mật khẩu Admin của Đức Anh:");
    if (pass === "kailios123") {
        localStorage.setItem('isAdmin', 'true'); // Lưu chìa khóa
        showToast("Chào Đức Anh! Quyền Admin đã được kích hoạt. ✅");
        
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) adminPanel.classList.remove('hidden');
        
        if (typeof renderSidebar === "function") renderSidebar();
    } else {
        showToast("Sai mật khẩu rồi bạn ơi! ❌");
        localStorage.removeItem('isAdmin'); // Đảm bảo không lưu bậy
    }
}

// 5. Hàm hiện khung soạn thảo (Chặn người lạ)
function showEditor() {
    if (!checkAdminPrivilege()) { // Lớp chặn số 1
        showToast("Bạn không có quyền thực hiện thao tác này! 🚫");
        return;
    }

    const content = document.getElementById('contentArea');
    const editor = document.getElementById('editorArea');
    
    if (content && editor) {
        content.classList.toggle('hidden');
        editor.classList.toggle('hidden');
    }
}

// 6. Hàm Đăng xuất
function adminLogout() {
    localStorage.removeItem('isAdmin'); // Hủy chìa khóa
    showToast("Đã đăng xuất quyền Admin.");
    location.reload(); 
}
