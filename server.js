const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'posts.json');

// 1. Cấu hình lưu file trực tiếp vào thư mục 'uploads' trên máy bạn
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath); // Tự tạo thư mục nếu chưa có
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 2. Khởi tạo file posts.json chuẩn
if (!fs.existsSync(DATA_FILE) || fs.readFileSync(DATA_FILE, 'utf8').trim() === "") {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

app.use(express.static('./'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API LẤY BÀI VIẾT
app.get('/api/posts', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
});

// API ĐĂNG BÀI (KHÔNG DÙNG CLOUDINARY)
app.post('/api/upload', upload.single('document'), (req, res) => {
    console.log("--- Đang xử lý đăng bài (Local) ---");
    try {
        const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const newPost = {
            id: Date.now(),
            title: req.body.title || "Không tiêu đề",
            content: req.body.content || "",
            category: req.body.category || 'daiso',
            fileName: req.file ? `/uploads/${req.file.filename}` : null, // Lưu đường dẫn nội bộ
            uploadTime: new Date().toLocaleString()
        };

        posts.push(newPost);
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
        
        console.log("✅ Đã lưu bài viết vào máy:", newPost.title);
        res.json({ status: "success", data: newPost });
    } catch (error) {
        console.error("❌ Lỗi:", error);
        res.status(500).json({ status: "error", message: "Lỗi ghi file!" });
    }
});
// API XÓA BÀI (Đã sửa lỗi so sánh ID)
app.delete('/api/posts/:id', (req, res) => {
    try {
        const idToDelete = req.params.id; // Lấy ID từ URL
        console.log("--- Yêu cầu xóa bài ID:", idToDelete);

        let posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        
        // Kiểm tra xem ID có tồn tại không trước khi xóa
        const initialLength = posts.length;
        
        // Dùng == thay vì === để tránh lỗi lệch kiểu dữ liệu (String vs Number)
        posts = posts.filter(p => p.id != idToDelete); 

        if (posts.length === initialLength) {
            console.log("⚠️ Không tìm thấy bài viết để xóa!");
            return res.status(404).json({ status: "error", message: "Không tìm thấy bài!" });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
        
        console.log("✅ Đã xóa bài thành công!");
        res.json({ status: "success", message: "Đã xóa bài viết!" });
    } catch (error) {
        console.error("❌ Lỗi khi xóa:", error);
        res.status(500).json({ status: "error" });
    }
});







app.listen(PORT, () => console.log(`🚀 LOCAL SERVER CHẠY TẠI: http://localhost:${PORT}`));