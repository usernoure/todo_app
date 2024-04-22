const express = require('express');
const router = express.Router();

// Route de base pour l'index
router.get('/', (req, res) => {
    res.send('Bienvenue sur Todo App');
});

module.exports = router;
