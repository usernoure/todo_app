CREATE TABLE task_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT,
    step_description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);