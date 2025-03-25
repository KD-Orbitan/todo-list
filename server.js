const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 3000;

// Kết nối Aiven MySQL qua biến môi trường
const dbConfig = {
    host: process.env.DATABASE_HOST || 'mysql-todo-mysql-yourorg.aivencloud.com',
    port: process.env.DATABASE_PORT || 3306,
    user: process.env.DATABASE_USERNAME || 'avnadmin',
    password: process.env.DATABASE_PASSWORD || 'your_password',
    database: process.env.DATABASE_NAME || 'defaultdb',
    ssl: { rejectUnauthorized: true } // Aiven yêu cầu SSL
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/tasks', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM tasks');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.post('/tasks', async (req, res) => {
    const { title, desc, deadline, completed, completedAt } = req.body;
    if (!title) return res.status(400).json({ error: 'Vui lòng nhập tiêu đề' });
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO tasks (id, title, `desc`, deadline, completed, completedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [Date.now(), title, desc || '', deadline || null, completed || false, completedAt || null]
        );
        const [rows] = await connection.execute('SELECT * FROM tasks');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM tasks WHERE id = ?', [id]);
        const [rows] = await connection.execute('SELECT * FROM tasks');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.put('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, desc, deadline, completed, completedAt } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [existing] = await connection.execute('SELECT * FROM tasks WHERE id = ?', [id]);
        if (!existing.length) {
            await connection.end();
            return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ' });
        }
        if (title && !title.trim()) {
            await connection.end();
            return res.status(400).json({ error: 'Vui lòng nhập tiêu đề mới' });
        }
        await connection.execute(
            'UPDATE tasks SET title = ?, `desc` = ?, deadline = ?, completed = ?, completedAt = ? WHERE id = ?',
            [
                title !== undefined ? title : existing[0].title,
                desc !== undefined ? desc : existing[0].desc,
                deadline !== undefined ? deadline : existing[0].deadline,
                completed !== undefined ? completed : existing[0].completed,
                completedAt !== undefined ? completedAt : existing[0].completedAt,
                id
            ]
        );
        const [rows] = await connection.execute('SELECT * FROM tasks');
        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});