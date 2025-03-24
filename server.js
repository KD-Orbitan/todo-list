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
    const taskText = req.body.task;
    if (!taskText) {
        return res.status(400).json({ error: 'Vui lòng nhập nội dung nhiệm vụ' });
    }
    const task = { id: Date.now(), text: taskText, deadline: req.body.deadline || '', completed: req.body.completed || false };
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
    if (req.body.task && !req.body.task.trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập nội dung mới' });
    }
    tasks = tasks.map(t => t.id === id ? {
        ...t,
        text: req.body.task !== undefined ? req.body.task : t.text,
        deadline: req.body.deadline !== undefined ? req.body.deadline : t.deadline,
        completed: req.body.completed !== undefined ? req.body.completed : t.completed
    } : t);
    saveTasks();
    res.json(tasks);
});

app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});