const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Đọc tasks từ file khi khởi động, nếu không có thì dùng mảng rỗng
let tasks = fs.existsSync('tasks.json') ? JSON.parse(fs.readFileSync('tasks.json')) : [];

// Hàm lưu tasks vào file
function saveTasks() {
    fs.writeFileSync('tasks.json', JSON.stringify(tasks));
}

// API lấy danh sách nhiệm vụ
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// API thêm nhiệm vụ
app.post('/tasks', (req, res) => {
    const taskText = req.body.task;
    if (!taskText) {
        return res.status(400).json({ error: 'Vui lòng nhập nội dung nhiệm vụ' });
    }
    const task = { id: Date.now(), text: taskText };
    tasks.push(task);
    saveTasks(); // Lưu sau khi thêm
    res.json(tasks);
});

// API xóa nhiệm vụ
app.delete('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    tasks = tasks.filter(task => task.id !== id);
    saveTasks(); // Lưu sau khi xóa
    res.json(tasks);
});

// API sửa nhiệm vụ
app.put('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const newText = req.body.task;
    if (!newText) {
        return res.status(400).json({ error: 'Vui lòng nhập nội dung mới' });
    }
    tasks = tasks.map(task => task.id === id ? { ...task, text: newText } : task);
    saveTasks(); // Lưu sau khi sửa
    res.json(tasks);
});

app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});