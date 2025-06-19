const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
app.use(express.json());
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});
app.use('/users', userRoutes);

module.exports = app;