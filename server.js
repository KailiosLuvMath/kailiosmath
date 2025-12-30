const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

// CHÚ Ý: Trên Render, ta phải lưu file vào thư mục /tmp để có quyền Ghi
const DATA_FILE = path.join('/tmp', 'posts.json');

// --- CẤU HÌNH CLOUDINARY ---
cloudinary.config({
  cloud_name: 'KailiosMath',
  api_key: '149882847232922',
  api_secret: 'NIbtfqdb88MUyPHRvN4ZKCBMKjY'
});

// Thiết lập lưu trữ trên mây
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kailios_math_uploads',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'txt']
  },
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // Giới hạn 20MB để tránh treo Server
});

// Khởi tạo file dữ liệu trong thư mục tạm nếu chưa có
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.use(express.static('./'));
app.use(express.json());

// API 1: Lấy toàn bộ bài viết
app.get('/api/posts', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (err) {
        res.json([]);
    }
});

// API 2: Nhận bài viết mới
app.post('/api/upload', upload.single('document'), (req, res) => {
    try {
        const posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const newPost = {
            id: Date.now(),
            title: req.body.title,
            content: req.body.content,
            category: req.body.category || 'daiso',
            fileName: req.file ? req.file.path : null, 
            uploadTime: new Date().toLocaleString()
        };
        posts.push(newPost);
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
        res.json({ status: "success", message: "Đã lưu lên Cloud! ✅", data: newPost });
    } catch (error) {
        console.error("Lỗi Server:", error);
        res.status(500).json({ status: "error", message: "Lỗi ghi file hoặc Upload!" });
    }
});

// API 3: Cập nhật bài viết
app.put('/api/posts/:id', upload.single('document'), (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const index = posts.findIndex(p => p.id === id);

        if (index !== -1) {
            posts[index].title = req.body.title;
            posts[index].content = req.body.content;
            if (req.file) {
                posts[index].fileName = req.file.path;
            }
            fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
            res.json({ status: "success", data: posts[index] });
        } else {
            res.status(404).json({ status: "error", message: "Không tìm thấy bài!" });
        }
    } catch (error) {
        res.status(500).json({ status: "error" });
    }
});

// API 4: Xóa bài viết
app.delete('/api/posts/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let posts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        posts = posts.filter(p => p.id !== id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
        res.json({ status: "success", message: "Đã xóa bài viết!" });
    } catch (error) {
        res.status(500).json({ status: "error" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server kailiosmath online tại Port: ${PORT}`));