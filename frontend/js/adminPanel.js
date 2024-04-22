document.addEventListener('DOMContentLoaded', function() {
    fetchUsersAndTasks();
    fetchUsers();
    checkLogin();
});

function fetchUsers() {
    const token = sessionStorage.getItem('token');
    fetch('http://localhost:3000/admin/users', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => response.json())
    .then(data => displayUsers(data))
    .catch(error => {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users. See console for more details.');
    });
}

function fetchUsersAndTasks() {
    const token = sessionStorage.getItem('token');
    console.log('Token used:', token);  // Vérifiez que le token est présent
    fetch('http://localhost:3000/admin/users-tasks', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Data received:', data);  // Vérifiez les données reçues
        displayUsersAndTasks(data);
    })
    .catch(error => {
        console.error('Error fetching users and tasks:', error);
        alert('Failed to fetch data from server. See console for more details.');
    });
}

function displayUsersAndTasks(data) {
    console.log('Displaying data:', data);  // Confirmer les données à afficher
    const userList = document.getElementById('userList');
    if (!userList) {
        console.error('UserList element not found');
        return;
    }
    userList.innerHTML = '';  // Nettoyer la liste avant d'ajouter de nouveaux éléments
    data.forEach(user => {
        const li = document.createElement('li');
        li.textContent = ` Nom: ${user.username} - Tâche: ${user.description || 'Pas de tâche'} - Complétée: ${user.is_completed ? 'Yes' : 'No'}`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.onclick = () => deleteUser(user.id);
        li.appendChild(deleteBtn);
        
        userList.appendChild(li);
    });
}

function toggleTasks(userDiv) {
    const taskList = userDiv.querySelector('.task-list');
    taskList.classList.toggle('hidden');
}

function displayUsers(users) {
    const userList = document.getElementById('userList');
    userList.innerHTML = ''; // Nettoyer la liste avant d'ajouter
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.username;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.onclick = () => deleteUser(user.id);
        li.appendChild(deleteBtn);

        userList.appendChild(li);
    });
}

function deleteUser(userId) {
    const token = sessionStorage.getItem('token');
    if (confirm('Confirmez-vous la suppression de cet utilisateur ?')) {
        fetch(`http://localhost:3000/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Utilisateur supprimé avec succès');
                fetchUsers(); // Mise à jour de la liste des utilisateurs
            } else {
                alert('Erreur lors de la suppression de l\'utilisateur');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}


function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Nettoyer la liste avant d'ajouter
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.description;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.onclick = () => deleteTask(task.id);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

function deleteTask(taskId) {
    const token = sessionStorage.getItem('token');
    if (confirm('Confirmez-vous la suppression de cette tâche ?')) {
        fetch(`http://localhost:3000/admin/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (response.ok) {
                alert('Tâche supprimée avec succès');
                fetchAdminTasks(); // Mise à jour de la liste des tâches
            } else {
                alert('Erreur lors de la suppression de la tâche');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}


function checkLogin() {
    const token = sessionStorage.getItem('token');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    if (token) {
        loginLink.style.display = 'none';  // Masquer le lien de connexion
        logoutLink.style.display = 'block';  // Afficher le lien de déconnexion
    } else {
        loginLink.style.display = 'block';  // Afficher le lien de connexion
        logoutLink.style.display = 'none';  // Masquer le lien de déconnexion
    }
}

function logout() {
    sessionStorage.removeItem('token');
    window.location.href = 'login.html';  // Rediriger vers la page de connexion après la déconnexion
}
