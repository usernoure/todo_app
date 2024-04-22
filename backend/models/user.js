const db = require('../database');

function findUserByUsername(username, callback) {
    db.query('SELECT * FROM users WHERE username = ?', [username], function(err, results) {
        if (err) {
            callback(err, null);
        } else {
            if (results.length === 0) {
                // Aucun utilisateur trouvé avec ce nom d'utilisateur
                callback(null, null);
            } else {
                // Utilisateur trouvé, retourne l'utilisateur et inclut le rôle
                callback(null, results[0]);
            }
        }
    });
}

module.exports = { findUserByUsername };
