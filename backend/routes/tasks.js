const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');

// Middleware pour vérifier le token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("No token provided");
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.SECRET_KEY || 'your_secret_key', (err, user) => {
        if (err) {
            console.log("Token verification failed:", err);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};



// Obtenir tous les tasks de l'utilisateur
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM tasks WHERE user_id = ?', [req.user.id], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Ajouter une nouvelle tâche
router.post('/', authenticateToken, (req, res) => {
    const { description } = req.body;
    db.query('INSERT INTO tasks (description, user_id) VALUES (?, ?)', [description, req.user.id], (err, result) => {
        if (err) throw err;
        res.status(201).send('Tâche ajoutée');
    });
});

// Modifier une tâche
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    db.query('UPDATE tasks SET description = ? WHERE id = ? AND user_id = ?', [description, id, req.user.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur lors de la mise à jour de la tâche');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Tâche non trouvée ou vous n’avez pas les droits sur cette tâche');
        }
        res.send('Tâche mise à jour avec succès');
    });
});




// Supprimer une tâche
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur lors de la suppression de la tâche');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Tâche non trouvée ou vous n’avez pas les droits sur cette tâche');
        }
        res.send('Tâche supprimée avec succès');
    });
});



// Marquer une tâche comme complétée
router.post('/:id/complete', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('UPDATE tasks SET is_completed = TRUE WHERE id = ? AND user_id = ?', [id, req.user.id], (err, result) => {
        if (err) {
            return res.status(500).send('Erreur serveur');
        }
        res.send('Tâche marquée comme complétée');
    });
});


router.post('/test', (req, res) => {
    res.status(200).send('Test endpoint accessible');
});



// Ajouter une étape à une tâche
router.post('/:taskId/steps', authenticateToken, (req, res) => {
    const { taskId } = req.params;
    const { step_description } = req.body;
    if (!step_description) {
        return res.status(400).send('Description de l\'étape requise');
    }
    db.query('INSERT INTO task_steps (task_id, step_description, is_completed) VALUES (?, ?, FALSE)', [taskId, step_description], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur lors de l\'ajout de l\'étape');
        }
        res.status(201).send('Étape ajoutée avec succès');
    });
});

// Marquer une étape comme complétée ou non
router.put('/steps/:stepId', authenticateToken, (req, res) => {
    const { stepId } = req.params;
    const { is_completed } = req.body; // True ou False
    db.query('UPDATE task_steps SET is_completed = ? WHERE id = ?', [is_completed, stepId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur lors de la mise à jour de l\'étape');
        }
        if (result.affectedRows === 0) {
            return res.status(404).send('Étape non trouvée');
        }
        updateTaskStatus(req.body.taskId); // Assumez que taskId est envoyé dans le corps de la requête
        res.send('État de l\'étape mis à jour');
    });
});


// Vérifier et mettre à jour le statut de la tâche globale basé sur ses étapes
function updateTaskStatus(taskId) {
    db.query('SELECT COUNT(*) AS total, SUM(is_completed) AS completed FROM task_steps WHERE task_id = ?', [taskId], (err, results) => {
        if (err) throw err;
        if (results[0].total === results[0].completed) {
            db.query('UPDATE tasks SET is_completed = TRUE WHERE id = ?', [taskId], (err) => {
                if (err) throw err;
            });
        }
    });
}


// Obtenir toutes les tâches avec leurs étapes
router.get('/', authenticateToken, (req, res) => {
    const query = `
        SELECT t.*, s.id as stepId, s.description as stepDescription, s.is_completed as stepCompleted 
        FROM tasks t
        LEFT JOIN task_steps s ON t.id = s.task_id
        WHERE t.user_id = ?
        ORDER BY t.id, s.id;
    `;
    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur de base de données');
        }
        // Regrouper les tâches et leurs étapes ici
        const tasks = {};
        results.forEach(row => {
            if (!tasks[row.id]) {
                tasks[row.id] = {
                    id: row.id,
                    description: row.description,
                    is_completed: row.is_completed,
                    steps: []
                };
            }
            if (row.stepId) {
                tasks[row.id].steps.push({
                    id: row.stepId,
                    description: row.stepDescription,
                    is_completed: row.stepCompleted
                });
            }
        });
        res.json(Object.values(tasks));
    });
});

module.exports = router;
