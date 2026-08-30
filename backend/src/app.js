const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TaskFlow API running' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tasks', require('./routes/task.routes'));

app.use(errorHandler); // always last

module.exports = app;