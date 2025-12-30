const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000; // Sửa để Render tự cấp Port
const DATA_FILE = './posts.json';

// --- CẤU HÌNH CLOUDINARY ---
cloudinary.config({
  cloud_name: 'KailiosMath',
  api_key: '149882847232922',
  api_secret: 'NIbtfqdb88MUyPHRvN4ZKCBMKjY'
});

// Thiết lập lưu trữ trên mây (Cloudinary) thay vì diskStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kailios_math_uploads',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'pdf', 'docx', 'txt']
  },
});
const upload = multer({ storage: storage });

// Khởi tạo file dữ liệu nếu chưa có
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

app.use(express.static('./'));
app.use(express.json());

// API 1: Lấy toàn bộ bài viết
app.get('/api/posts', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

// API 2: Nhận bài viết mới (Lưu lên Cloudinary)
app.post('/api/upload', upload.single('document'), (req, res) => {
    try {
        const posts = JSON.parse(fs.readFileSync(DATA_FILE));
        const newPost = {
            id: Date.now(),
            title: req.body.title,
            content: req.body.content,
            category: req.body.category || 'daiso',
            // req.file.path lúc này là link URL dạng https://res.cloudinary.com/...
            fileName: req.file ? req.file.path : null, 
            uploadTime: new Date().toLocaleString()
        };
        posts.push(newPost);
        fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
        res.json({ status: "success", message: "Đã lưu vĩnh viễn lên Cloud! ✅", data: newPost });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Lỗi khi lưu bài!" });
    }
});

// API 3: Cập nhật bài viết (Tính năng Edit bạn vừa muốn thêm)
app.put('/api/posts/:id', upload.single('document'), (req, res) => {
    const id = parseInt(req.params.id);
    let posts = JSON.parse(fs.readFileSync(DATA_FILE));
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
});

// API 4: Xóa bài viết
app.delete('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let posts = JSON.parse(fs.readFileSync(DATA_FILE));
    
    // Lưu ý: Với Cloudinary, việc xóa file vật lý cần API Secret phức tạp hơn.
    // Tạm thời ta chỉ xóa thông tin trong file JSON để bài viết biến mất khỏi web.
    posts = posts.filter(p => p.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    
    res.json({ status: "success", message: "Đã xóa bài viết thành công!" });
});

app.listen(PORT, () => console.log(`🚀 Server running: http://localhost:${PORT}`));