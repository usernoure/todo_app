// Appelle au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    checkLogin();
    if (document.getElementById('todoList')) {
        fetchTasks();  // N'appelle fetchTasks() que si l'élément 'todoList' existe
    }
});


function addTask() {
    const descriptionInput = document.getElementById('taskDescription');
    const description = descriptionInput.value;

    // Vérifie si la description de la tâche est vide
    if (!description.trim()) {
        alert("Veuillez entrer un nom pour la tâche.");
        return;
    }

    const token = sessionStorage.getItem('token');
    fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ description })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Échec de l'ajout de la tâche, veuillez réessayer.");
        }
        return response.text();
    })
    .then(data => {
        alert("Tâche ajoutée avec succès.");
        descriptionInput.value = ''; // Réinitialise le champ de saisie
        fetchTasks(); // Rafraîchit la liste des tâches
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Impossible d'ajouter la tâche. Veuillez vous inscrire ou vous connecter!");
    });
}

function completeTask(taskId) {
    const token = sessionStorage.getItem('token');
    fetch(`http://localhost:3000/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(() => {
        alert('Tâche marquée comme complétée');
        fetchTasks(); // Rafraîchit la liste des tâches
    })
    .catch(error => console.error('Erreur:', error));
}

function deleteTask(taskId) {
    const token = sessionStorage.getItem('token');
    fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Échec de la suppression de la tâche');
        return response.text();
    })
    .then(() => {
        alert('Tâche supprimée avec succès');
        fetchTasks(); // Rafraîchit la liste des tâches
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert("Erreur lors de la suppression de la tâche.");
    });
}


function editTask(taskId, oldDescription) {
    const newDescription = prompt('Modifier la tâche:', oldDescription);
    if (newDescription && newDescription !== oldDescription) {
        const token = sessionStorage.getItem('token');
        fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ description: newDescription })
        })
        .then(response => {
            if (!response.ok) throw new Error('Échec de la mise à jour de la tâche');
            return response.text();
        })
        .then(() => {
            alert('Tâche mise à jour avec succès');
            fetchTasks(); // Rafraîchit la liste des tâches
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert("Erreur lors de la mise à jour de la tâche.");
        });
    }
}



function updateUI(tasks) {
    const listElement = document.getElementById('todoList');
    listElement.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = document.createElement('li');
        taskElement.className = task.is_completed ? 'completed' : '';

        const taskText = document.createElement('span');
        taskText.textContent = task.description;
        taskText.className = 'task-text';
        taskElement.appendChild(taskText);
        task.steps = task.steps || [];

        // Ajouter les étapes ici si elles existent
        if (task.steps && Array.isArray(task.steps)) {
            const stepsList = document.createElement('ul');
            task.steps.forEach(step => {
                const stepElement = document.createElement('li');
                stepElement.textContent = `${step.description} - ${step.is_completed ? 'Complétée' : 'En cours'}`;
                stepsList.appendChild(stepElement);
            });
            taskElement.appendChild(stepsList);
        }

        listElement.appendChild(taskElement);
    });
}




function fetchTasks() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        console.log("No token found, user is probably not logged in.");
        return; // Stop the function here.
    }

    fetch('http://localhost:3000/tasks', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(handleResponse)
    .then(tasks => {
        console.log("Tasks received:", tasks); // Ajoutez ceci pour voir les tâches reçues
        updateUI(tasks);
    })
    .catch(handleError);
}


function handleResponse(response) {
    if (!response.ok) throw Error('Erreur lors de la récupération des données: ' + response.statusText);
    return response.json();
}

function handleError(error) {
    console.error('Error:', error);
    alert('Échec de la récupération des tâches. Veuillez consulter la console pour plus de détails.');
}


function register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        // Réinitialise le formulaire après un enregistrement réussi
        document.getElementById('registerForm').reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Échec de l\'inscription. Veuillez consulter la console pour plus de détails.');
    });
}


// Fonction pour vérifier l'état de connexion et ajuster l'interface utilisateur
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

// Fonction pour gérer la déconnexion
function logout() {
    sessionStorage.removeItem('token');
    const listElement = document.getElementById('todoList');
    if (listElement) listElement.innerHTML = ''; // Nettoie la liste des tâches
    checkLogin();
    window.location.href = 'index.html';
}


function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        sessionStorage.setItem('token', data.token);
        if (data.role === 'admin') {
            window.location.href = 'admin.html'; // Assurez-vous que ce chemin est correct
        } else {
            window.location.href = 'task.html'; // Redirection vers une page différente pour les non-admins
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Échec de la connexion: Identifiants incorrects ou problème de serveur.');
    });
}


function addStep(taskId) {
    const stepDescription = prompt("Description de la nouvelle étape:");
    if (!stepDescription) return;

    const token = sessionStorage.getItem('token');
    fetch(`http://localhost:3000/tasks/${taskId}/steps`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ description: stepDescription })
    })
    .then(response => response.json())
    .then(() => {
        alert("Étape ajoutée avec succès.");
        fetchTasks();  // Refresh the task list to show new step
    })
    .catch(error => console.error('Error:', error));
}

function toggleStepStatus(stepId) {
    const token = sessionStorage.getItem('token');
    fetch(`http://localhost:3000/steps/${stepId}/toggle`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Échec du changement de statut de l'étape");
        fetchTasks();  // Refresh tasks to show updated step status
    })
    .catch(error => console.error('Error:', error));
}
