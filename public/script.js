function addTask() {
    const taskInput = document.getElementById('taskInput');
    const deadlineInput = document.getElementById('deadlineInput');
    const task = taskInput.value.trim();
    const deadline = deadlineInput.value;
    if (!task) {
        alert('Vui lòng nhập nội dung nhiệm vụ!');
        return;
    }
    fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, deadline, completed: false })
    })
        .then(response => {
            if (!response.ok) throw new Error('Lỗi từ server');
            return response.json();
        })
        .then(tasks => displayTasks(tasks))
        .catch(error => alert('Có lỗi xảy ra: ' + error.message));
    taskInput.value = '';
    deadlineInput.value = '';
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id}, this.checked)">
        <div class="task-content">
          <span class="task-text ${task.completed ? 'completed' : ''}" title="${task.text}">${task.text}</span>
        </div>
        <span class="deadline">${task.deadline || 'No deadline'}</span>
        <button onclick="editTask(${task.id})">Sửa</button>
        <button onclick="deleteTask(${task.id})">Xóa</button>
      `;
        taskList.appendChild(li);
    });
}

function toggleTask(id, completed) {
    fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
    })
        .then(response => {
            if (!response.ok) throw new Error('Lỗi từ server');
            return response.json();
        })
        .then(tasks => displayTasks(tasks))
        .catch(error => alert('Có lỗi xảy ra: ' + error.message));
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
    const currentTask = tasks.find(t => t.id === id);
    const newText = prompt('Nhập nội dung mới:', currentTask.text);
    if (newText === null) return;
    const trimmedText = newText.trim();
    if (!trimmedText) {
        alert('Vui lòng nhập nội dung mới!');
        return;
    }
    // Tạo input date tạm thời trong DOM để chọn deadline
    const tempInput = document.createElement('input');
    tempInput.type = 'date';
    tempInput.value = currentTask.deadline || '';
    document.body.appendChild(tempInput);
    tempInput.focus();
    tempInput.click();
    const newDeadline = new Promise(resolve => {
        tempInput.onchange = () => resolve(tempInput.value);
    });
    newDeadline.then(value => {
        document.body.removeChild(tempInput);
        fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task: trimmedText,
                deadline: value || currentTask.deadline
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Lỗi từ server');
                return response.json();
            })
            .then(tasks => displayTasks(tasks))
            .catch(error => alert('Có lỗi xảy ra: ' + error.message));
    });
}

let tasks = [];
fetch('/tasks')
    .then(res => res.json())
    .then(data => {
        tasks = data;
        displayTasks(tasks);
    });