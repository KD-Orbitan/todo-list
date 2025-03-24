const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

let tasks = fs.existsSync('tasks.json') ? JSON.parse(fs.readFileSync('tasks.json')) : [];

function saveTasks() {
    fs.writeFileSync('tasks.json', JSON.stringify(tasks));
}

app.get('/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/tasks', (req, res) => {
    const title = req.body.title;
    if (!title) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề nhiệm vụ' });
    }
    const task = {
        id: Date.now(),
        title,
        desc: req.body.desc || '',
        deadline: req.body.deadline || '',
        completed: req.body.completed || false,
        completedAt: req.body.completedAt || null
    };
    tasks.push(task);
    saveTasks();
    res.json(tasks);
});

app.delete('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    res.json(tasks);
});

app.put('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ' });
    if (req.body.title && !req.body.title.trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập tiêu đề mới' });
    }
    tasks = tasks.map(t => t.id === id ? {
        ...t,
        title: req.body.title !== undefined ? req.body.title : t.title,
        desc: req.body.desc !== undefined ? req.body.desc : t.desc,
        deadline: req.body.deadline !== undefined ? req.body.deadline : t.deadline,
        completed: req.body.completed !== undefined ? req.body.completed : t.completed,
        completedAt: req.body.completedAt !== undefined ? req.body.completedAt : t.completedAt
    } : t);
    saveTasks();
    res.json(tasks);
});

app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});