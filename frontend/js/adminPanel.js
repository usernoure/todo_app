document.addEventListener('DOMContentLoaded', function() {
    fetchUsersAndTasks();
    checkLogin();
});

function fetchUsersAndTasks() {
    const token = sessionStorage.getItem('token');
    fetch('http://localhost:3000/admin/users-tasks', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => displayUsersAndTasks(data))
    .catch(error => console.error('Erreur lors de la récupération des utilisateurs et tâches:', error));
}

function displayUsersAndTasks(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';  // Clear existing entries

    const table = document.createElement('table');
    table.className = 'admin-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Utilisateur', 'Tâche', 'Statut', 'Actions'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    users.forEach(user => {
        user.tasks.forEach((task, index) => {
            const taskRow = document.createElement('tr');

            if (index === 0) {
                const userCell = document.createElement('td');
                userCell.textContent = user.username;

                // Add delete user button
                const deleteUserBtn = document.createElement('button');
                deleteUserBtn.className = 'btn delete-user-btn';
                deleteUserBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteUserBtn.onclick = () => deleteUser(user.id);

                userCell.appendChild(deleteUserBtn);
                userCell.rowSpan = user.tasks.length;  // Make the user name span all tasks
                taskRow.appendChild(userCell);
            }

            const taskCell = document.createElement('td');
            taskCell.textContent = task.description;
            taskRow.appendChild(taskCell);

            const statusCell = document.createElement('td');
            const statusToggle = document.createElement('button');
            statusToggle.className = task.is_completed ? 'btn status-btn completed' : 'btn status-btn';
            statusToggle.textContent = task.is_completed ? 'Complétée' : 'En cours';
            statusToggle.onclick = () => toggleTaskStatus(task.id, !task.is_completed);
            statusCell.appendChild(statusToggle);
            taskRow.appendChild(statusCell);

            const actionCell = document.createElement('td');
            const deleteTaskBtn = document.createElement('button');
            deleteTaskBtn.className = 'btn delete-task-btn';
            deleteTaskBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteTaskBtn.onclick = () => deleteTask(task.id);
            actionCell.appendChild(deleteTaskBtn);
            taskRow.appendChild(actionCell);

            tbody.appendChild(taskRow);
        });
    });

    table.appendChild(tbody);
    userList.appendChild(table);
}




function toggleTaskStatus(taskId, isCompleted) {
    const token = sessionStorage.getItem('token');
    fetch(`http://localhost:3000/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_completed: !isCompleted })
    })
    .then(response => response.json())
    .then(() => {
        fetchUsersAndTasks(); // Refresh list to show updated status
    })
    .catch(error => console.error('Error updating task status:', error));
}




function deleteUser(userId) {
    const token = sessionStorage.getItem('token');
    if (confirm('Confirmez-vous la suppression de cet utilisateur ?')) {
        fetch(`http://localhost:3000/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(response => {
            if (!response.ok) throw new Error('Échec de la suppression de l\'utilisateur');
            alert('Utilisateur supprimé avec succès');
            fetchUsersAndTasks();  // Mise à jour de la liste après suppression
        })
        .catch(error => alert('Erreur lors de la suppression de l\'utilisateur:', error));
    }
}

function deleteTask(taskId) {
    const token = sessionStorage.getItem('token');
    if (confirm('Confirmez-vous la suppression de cette tâche ?')) {
        fetch(`http://localhost:3000/admin/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(response => {
            if (!response.ok) throw new Error('Échec de la suppression de la tâche');
            alert('Tâche supprimée avec succès');
            fetchUsersAndTasks();  // Mise à jour de la liste après suppression
        })
        .catch(error => alert('Erreur lors de la suppression de la tâche:', error));
    }
}

function checkLogin() {
    const token = sessionStorage.getItem('token');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    if (token) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
    }
}

function logout() {
    sessionStorage.removeItem('token');
    window.location.href = 'login.html';
}
