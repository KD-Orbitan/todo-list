function addTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim(); // Loại bỏ khoảng trắng
    if (!task) {
        alert('Vui lòng nhập nội dung nhiệm vụ!');
        return;
    }
    fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task })
    })
        .then(response => {
            if (!response.ok) throw new Error('Lỗi từ server');
            return response.json();
        })
        .then(tasks => displayTasks(tasks))
        .catch(error => alert('Có lỗi xảy ra: ' + error.message));
    taskInput.value = '';
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `${task.text} 
        <button onclick="editTask(${task.id})">Sửa</button>
        <button onclick="deleteTask(${task.id})">Xóa</button>`;
        taskList.appendChild(li);
    });
}

function deleteTask(id) {
    if (confirm('Bạn có chắc muốn xóa nhiệm vụ này không?')) {
        fetch(`/tasks/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) throw new Error('Lỗi từ server');
                return response.json();
            })
            .then(tasks => displayTasks(tasks))
            .catch(error => alert('Có lỗi xảy ra: ' + error.message));
    }
}

function editTask(id) {
    const newText = prompt('Nhập nội dung mới:');
    if (newText === null) return; // Người dùng bấm Cancel
    const trimmedText = newText.trim();
    if (!trimmedText) {
        alert('Vui lòng nhập nội dung mới!');
        return;
    }
    fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: trimmedText })
    })
        .then(response => {
            if (!response.ok) throw new Error('Lỗi từ server');
            return response.json();
        })
        .then(tasks => displayTasks(tasks))
        .catch(error => alert('Có lỗi xảy ra: ' + error.message));
}

// Tải danh sách khi khởi động
fetch('/tasks')
    .then(res => res.json())
    .then(tasks => displayTasks(tasks));