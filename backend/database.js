const mysql = require('mysql');

// Création de la connexion à la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'todo_app'
});

// Connexion à la base de données
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion: ' + err.stack);
        return;
    }
    console.log('Connecté à la base de données avec l\'ID ' + db.threadId);
});

module.exports = db;
