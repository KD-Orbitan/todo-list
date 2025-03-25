let tasks = [];
let currentFilter = 'today';

function addTask() {
    const title = document.getElementById('titleInput').value.trim();
    const desc = document.getElementById('descInput').value.trim();
    const deadline = document.getElementById('deadlineInput').value;
    const today = new Date().toISOString().split('T')[0]; // Chuẩn hóa ngày hiện tại
    if (!title) { alert('Vui lòng nhập tiêu đề nhiệm vụ!'); return; }
    if (deadline && deadline < today) { alert('Deadline không thể là ngày trong quá khứ!'); return; }

    fetch('/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, desc, deadline, completed: false, completedAt: null }) })
        .then(response => { if (!response.ok) throw new Error('Lỗi từ server'); return response.json(); })
        .then(data => { tasks = data; displayTasks(); })
        .catch(error => alert('Có lỗi xảy ra: ' + error.message));
    document.getElementById('titleInput').value = '';
    document.getElementById('descInput').value = '';
    document.getElementById('deadlineInput').value = '';
}

function displayTasks() {
    const taskList = document.getElementById('taskList');
    const inputGroup = document.querySelector('.input-group');
    taskList.innerHTML = '';
    const today = new Date().toISOString().split('T')[0]; // Chuẩn hóa ngày hiện tại
    let filteredTasks = [];

    if (currentFilter === 'today') {
        filteredTasks = tasks.filter(task => !task.completed && task.deadline === today);
        inputGroup.classList.remove('hidden');
    } else if (currentFilter === 'upcoming') {
        filteredTasks = tasks.filter(task => !task.completed && task.deadline > today);
        inputGroup.classList.remove('hidden');
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        inputGroup.classList.add('hidden');
    }

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id}, this.checked)">
      <div class="task-content">
        <span class="task-title">${task.title}</span>
        <span class="task-desc">${task.desc || ''}</span>
        <span class="task-deadline">${task.deadline || 'No deadline'}</span>
      </div>
      <div class="task-actions">
        <button onclick="editTask(${task.id})">Sửa</button>
        <button onclick="deleteTask(${task.id})">Xóa</button>
      </div>
    `;
        taskList.appendChild(li);
    });
}

function toggleTask(id, completed) {
    const completedAt = completed ? new Date().toISOString().replace('T', ' ').substring(0, 19) : null;
    fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed, completedAt })
    })
        .then(response => { if (!response.ok) throw new Error('Lỗi từ server'); return response.json(); })
        .then(data => { tasks = data; displayTasks(); })
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
            .then(data => {
                tasks = data;
                displayTasks();
            })
            .catch(error => alert('Có lỗi xảy ra: ' + error.message));
    }
}

function editTask(id) {
    const currentTask = tasks.find(t => t.id === id);
    const newTitle = prompt('Nhập tiêu đề mới:', currentTask.title);
    if (newTitle === null) return;
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
        alert('Vui lòng nhập tiêu đề mới!');
        return;
    }
    const newDesc = prompt('Nhập mô tả mới:', currentTask.desc || '');
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
        const today = new Date().toISOString().split('T')[0];
        if (value && value < today) {
            alert('Deadline không thể là ngày trong quá khứ!');
            return;
        }
        fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: trimmedTitle,
                desc: newDesc || '',
                deadline: value || currentTask.deadline
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Lỗi từ server');
                return response.json();
            })
            .then(data => {
                tasks = data;
                displayTasks();
            })
            .catch(error => alert('Có lỗi xảy ra: ' + error.message));
    });
}

document.getElementById('toggleSidebar').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('hidden');
});

document.querySelectorAll('.sidebar-menu li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelector('.sidebar-menu li.active').classList.remove('active');
        item.classList.add('active');
        currentFilter = item.getAttribute('data-filter');
        displayTasks();
    });
});

fetch('/tasks')
    .then(res => res.json())
    .then(data => {
        tasks = data;
        displayTasks();
    });