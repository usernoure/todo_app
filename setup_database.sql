-- Suppression de la base de données si elle existe déjà
DROP DATABASE IF EXISTS todo_app;

-- Création de la nouvelle base de données
CREATE DATABASE todo_app;
USE todo_app;

-- Création de la table des utilisateurs avec un email optionnel
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(10) DEFAULT 'user',

    CHECK (email IS NULL OR email LIKE '%@%') -- S'assure que l'email, si fourni, contient '@'
);

-- Création de la table des tasks
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ajouts d'exemples de données dans la table des utilisateurs
INSERT INTO users (username, password) VALUES ('user1', 'hashedpassword1');
INSERT INTO users (username, email, password) VALUES ('user2', 'user2@example.com', 'hashedpassword2');

-- Ajouts d'exemples de données dans la table des tasks
INSERT INTO tasks (user_id, description, is_completed) VALUES (1, 'Finish the SQL setup', FALSE);
INSERT INTO tasks (user_id, description, is_completed) VALUES (1, 'Post the project to GitHub', TRUE);
INSERT INTO tasks (user_id, description, is_completed) VALUES (2, 'Prepare the project presentation', FALSE);
