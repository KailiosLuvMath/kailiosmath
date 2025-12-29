// File: search.js
document.getElementById('searchInput').addEventListener('input', function(e) {
    let keyword = e.target.value.toLowerCase();
    
    // 1. Tìm trong Menu Sidebar
    let menuItems = document.querySelectorAll('.sidebar ul li');
    menuItems.forEach(item => {
        let text = item.textContent.toLowerCase();
        item.style.display = text.includes(keyword) ? "" : "none";
    });

    // 2. Tìm trong nội dung bài viết chính
    let article = document.getElementById('contentArea');
    let title = article.querySelector('h1').textContent.toLowerCase();
    
    // Nếu từ khóa không có trong tiêu đề bài đang xem, làm mờ nội dung bài đó
    if (!title.includes(keyword) && keyword !== "") {
        article.style.opacity = "0.3";
    } else {
        article.style.opacity = "1";
    }
});