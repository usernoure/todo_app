const jwt = require('jsonwebtoken');
const db = require('../database');

const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(401).send('Accès refusé');
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            console.log('Token verification failed');
            return res.status(403).send('Token invalide');
        }

        db.query('SELECT role FROM users WHERE id = ?', [decoded.id], (error, results) => {
            if (error) {
                console.log('Database error');
                return res.status(500).send('Erreur de base de données');
            }
            if (results.length && results[0].role === 'admin') {
                next();
            } else {
                console.log('Access denied for user role:', results[0]?.role);
                return res.status(403).send('Accès refusé');
            }
        });
    });
};


module.exports = authenticateAdmin;
