const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = './posts.json';

// Khởi tạo file dữ liệu nếu chưa có
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));

app.use(express.static('./'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// API 1: Lấy toàn bộ bài viết đã lưu
app.get('/api/posts', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

// API 2: Nhận bài viết mới và lưu vào file
app.post('/api/upload', upload.single('document'), (req, res) => {
    const posts = JSON.parse(fs.readFileSync(DATA_FILE));
    const newPost = {
        id: Date.now(),
        title: req.body.title,
        content: req.body.content,
        category: req.body.category || 'daiso',
        fileName: req.file ? req.file.filename : null,
        uploadTime: new Date().toLocaleString()
    };
    posts.push(newPost);
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    res.json({ status: "success", message: "Đã lưu vĩnh viễn! ✅", data: newPost });
});

// API Xóa bài viết
app.delete('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let posts = JSON.parse(fs.readFileSync(DATA_FILE));
    
    // Tìm bài viết để lấy tên file cần xóa trong thư mục uploads
    const postToDelete = posts.find(p => p.id === id);
    if (postToDelete && postToDelete.fileName) {
        const filePath = path.join(__dirname, 'uploads', postToDelete.fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Xóa file vật lý
    }

    // Lọc bỏ bài viết khỏi danh sách
    posts = posts.filter(p => p.id !== id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
    
    res.json({ status: "success", message: "Đã xóa bài viết thành công!" });
});




//server chạy -))
app.listen(PORT, () => console.log(`🚀 Server running: http://localhost:${PORT}`));