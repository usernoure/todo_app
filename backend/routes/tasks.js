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



module.exports = router;
