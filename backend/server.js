const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const authenticateAdmin = require('./middlewares/authenticateAdmin');

// Activer CORS
app.use(cors());

app.use(bodyParser.json());

// Importer les routers
const indexRouter = require('./routes/index');
const tasksRouter = require('./routes/tasks');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/adminRoutes');


// Utiliser les routers
app.use('/', indexRouter);
app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);
app.use('/admin', authenticateAdmin, adminRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
