const express = require('express');
const router = express.Router();
const db = require('../database');
const authenticateAdmin = require('../middlewares/authenticateAdmin');

router.get('/users-tasks', authenticateAdmin, (req, res) => {
    const query = `
        SELECT users.username, users.role, tasks.description, tasks.is_completed
        FROM users
        LEFT JOIN tasks ON users.id = tasks.user_id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users and tasks:', err);
            return res.status(500).send('Erreur de base de données');
        }
        res.json(results);
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
