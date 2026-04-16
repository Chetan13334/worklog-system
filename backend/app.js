require('dotenv').config();
const cors = require('cors');
const express = require('express');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
require('./models');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(authRoutes);
app.use(attendanceRoutes);
app.use(leaveRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error'
  });
});

async function bootstrap() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

bootstrap();

module.exports = app;
