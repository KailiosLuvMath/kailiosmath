// Biến toàn cục để theo dõi ID bài viết đang được sửa
let currentEditingId = null; 

// 1. Hàm lưu bài viết (Hỗ trợ cả ĐĂNG MỚI và CẬP NHẬT)
async function savePost() {
    if (localStorage.getItem('isAdmin') !== 'true') {
        showToast("Bạn không có quyền thực hiện! ❌");
        return;
    }
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postText').value;
    const fileInput = document.getElementById('fileUpload'); 

    if (!title || !content) {
        showToast("Nhập đủ tiêu đề và nội dung nhé! ⚠️");
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (fileInput.files[0]) {
        formData.append('document', fileInput.files[0]);
    }

    // LOGIC THAY ĐỔI Ở ĐÂY:
    // Nếu có currentEditingId thì gọi API PUT (sửa), ngược lại gọi POST (mới)
    const url = currentEditingId ? `/api/posts/${currentEditingId}` : '/api/upload';
    const method = currentEditingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            body: formData,
            headers: { 'Admin-Key': 'kailios123' } 
        });

        const result = await response.json();
        
        if (result.status === "success") {
            showToast(currentEditingId ? "Đã cập nhật bài viết thành công! ✨" : "Đã xuất bản bài mới! 🚀");
            
            // Hiển thị nội dung
            const articleArea = document.getElementById('contentArea');
            articleArea.innerHTML = `
                <nav class="breadcrumb">Trang chủ / ${currentEditingId ? 'Vừa chỉnh sửa' : 'Mới đăng'}</nav>
                <h1>${result.data.title} 📐</h1>
                <p><i>Cập nhật lúc: ${result.data.uploadTime || 'Vừa xong'}</i></p>
                <div class="article-body">${result.data.content.replace(/\n/g, '<br>')}</div>
                ${result.data.fileName ? `<p>📂 Tài liệu: <a href="/uploads/${result.data.fileName}" target="_blank">Xem file</a></p>` : ''}
            `;
            
            if (window.MathJax) MathJax.typeset();
            
            // RESET TRẠNG THÁI: Quan trọng để lần sau đăng bài mới không bị dính bài cũ
            currentEditingId = null;
            document.getElementById('postTitle').value = "";
            document.getElementById('postText').value = "";
            const submitBtn = document.querySelector('#editorArea button[onclick="savePost()"]');
            if (submitBtn) submitBtn.innerHTML = "Xuất bản bài báo 🚀";

            showEditor(); 
            renderSidebar(); 
        }
    } catch (error) {
        showToast("Lỗi kết nối Server! 📡");
    }
}

// 2. Hàm vẽ Sidebar (Thêm nút Sửa ✏️)
async function renderSidebar(filterText = "") {
    try {
        const response = await fetch('/api/posts');
        const posts = await response.json();
        window.allStoredPosts = posts;

        const sidebar = document.getElementById('dynamicPostList');
        if (!sidebar) return;
        sidebar.innerHTML = ""; 
        
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        const filtered = posts.filter(p => p.title.toLowerCase().includes(filterText.toLowerCase()));

        filtered.forEach(post => {
            const li = document.createElement('li');
            li.className = "sidebar-item"; 
            
            li.innerHTML = `
                <a href="javascript:void(0)" onclick="viewStoredPost(${post.id})" style="text-decoration:none; color:inherit; font-weight:500; flex:1;">
                    📄 ${post.title}
                </a>
                ${isAdmin ? `
                    <button onclick="editPost(${post.id})" class="edit-btn" title="Sửa bài">✏️</button>
                    <button onclick="deletePost(${post.id})" class="delete-btn" title="Xóa bài">🗑️</button>
                ` : ''}
            `;
            sidebar.appendChild(li);
        });
    } catch (e) { console.log("Lỗi tải danh sách bài viết."); }
}

// 3. Hàm kích hoạt chế độ SỬA
function editPost(id) {
    if (localStorage.getItem('isAdmin') !== 'true') return;

    const post = window.allStoredPosts.find(p => p.id === id);
    if (!post) return;

    // Đưa dữ liệu vào form
    currentEditingId = id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postText').value = post.content;

    // Đổi giao diện nút bấm
    const submitBtn = document.querySelector('#editorArea button[onclick="savePost()"]');
    if (submitBtn) submitBtn.innerHTML = "Lưu thay đổi 💾";

    // Mở khung soạn thảo
    const content = document.getElementById('contentArea');
    const editor = document.getElementById('editorArea');
    content.classList.add('hidden');
    editor.classList.remove('hidden');
    
    showToast("Đang sửa bài: " + post.title);
}

// 4. Các hàm Xóa và Xem bài (Giữ nguyên logic bảo mật của bạn)
async function deletePost(id) {
    if (localStorage.getItem('isAdmin') !== 'true') {
        showToast("Dừng lại! Chỉ Admin mới được xóa. 🛑");
        return;
    }
    if (confirm("Chắc chắn xóa chứ?")) {
        try {
            const res = await fetch(`/api/posts/${id}`, { 
                method: 'DELETE',
                headers: { 'Admin-Key': 'kailios123' } 
            });
            showToast("Đã xóa xong! 🗑️");
            renderSidebar(); 
        } catch (e) { showToast("Lỗi khi xóa! ❌"); }
    }
}

function viewStoredPost(id) {
    const post = window.allStoredPosts.find(p => p.id === id);
    if (post) {
        const articleArea = document.getElementById('contentArea');
        articleArea.innerHTML = `
            <nav class="breadcrumb">Trang chủ / Bài viết đã lưu</nav>
            <h1>${post.title} 📐</h1>
            <p><i>Người viết: Kailios - Đức Anh</i></p>
            <div class="article-body">${post.content.replace(/\n/g, '<br>')}</div>
            ${post.fileName ? `<p>📎 <b>File:</b> <a href="/uploads/${post.fileName}" target="_blank">Mở tài liệu</a></p>` : ''}
        `;
        if (window.MathJax) MathJax.typeset();
        window.scrollTo(0, 0);
    }
}

window.onload = () => renderSidebar();
document.getElementById('searchInput')?.addEventListener('keyup', (e) => renderSidebar(e.target.value));