const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateAdmin = require('../middlewares/authenticateAdmin');

router.get('/users-tasks', authenticateAdmin, (req, res) => {
    const query = `
        SELECT users.id as userId, users.username, tasks.id as taskId, tasks.description, tasks.is_completed
        FROM users
        LEFT JOIN tasks ON users.id = tasks.user_id
        ORDER BY users.id, tasks.id;
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Erreur de base de données');
        }

        const usersMap = {};

        results.forEach(row => {
            if (!usersMap[row.userId]) {
                usersMap[row.userId] = {
                    id: row.userId,
                    username: row.username,
                    tasks: []
                };
            }

            if (row.taskId) {
                usersMap[row.userId].tasks.push({
                    id: row.taskId,
                    description: row.description,
                    is_completed: row.is_completed
                });
            }
        });

        res.json(Object.values(usersMap));
    });
});




router.delete('/users/:id', authenticateAdmin, (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur de base de données');
        }
        if (result.affectedRows > 0) {
            res.send('Utilisateur supprimé avec succès');
        } else {
            res.status(404).send('Utilisateur non trouvé');
        }
    });
});

router.delete('/tasks/:id', authenticateAdmin, (req, res) => {
    const taskId = req.params.id;
    db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur de base de données');
        }
        if (result.affectedRows > 0) {
            res.send('Tâche supprimée avec succès');
        } else {
            res.status(404).send('Tâche non trouvée');
        }
    });
});


module.exports = router;
