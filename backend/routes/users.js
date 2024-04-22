const express = require('express');
const router = express.Router();
const db = require('../database'); // Assure-toi que le chemin est correct
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secretKey = 'your_secret_key'; // Utilise une clé complexe en production

// Expression régulière pour valider l'email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Le nom d\'utilisateur et le mot de passe sont requis');
    }

    // Validation de l'email si fourni
    if (email && !emailRegex.test(email)) {
        return res.status(400).send('Format de l\'email invalide.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // L'email est optionnel, donc il peut être nul
        const result = await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email || null, hashedPassword]);
        res.status(201).send('Utilisateur créé');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});


const { findUserByUsername } = require('../models/user');

// Connexion d'un utilisateur avec gestion des rôles
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Le nom d\'utilisateur et le mot de passe sont requis');
    }

    findUserByUsername(username, async (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erreur serveur');
        }
        if (!user) {
            return res.status(401).send('Identifiants incorrects');  // Pas d'utilisateur trouvé
        }
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).send('Identifiants incorrects');  // Mot de passe incorrect
        }
        const token = jwt.sign({ id: user.id, role: user.role }, 'your_secret_key', { expiresIn: '1h' });
        res.json({ token: token, role: user.role });  // Envoie le token et le rôle de l'utilisateur
    });
});


module.exports = router;
