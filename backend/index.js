require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/database');
const logger = require('./config/logger');
const webhookRoute = require('./routes/webhook.route');
const authRoutes = require("./routes/auth.route");
const groupRoutes = require("./routes/group.route");
const TransactionRoutes = require("./routes/transaction.route");
const splitRoutes = require("./routes/split.route");
const cors = require("cors");

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/v1/webhook', webhookRoute);
app.use("/api/auth", authRoutes);
app.use("/api/transaction" , TransactionRoutes);
app.use("/api/group" , groupRoutes);
app.use("/api/splits", splitRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  logger.error(`Global error: ${err.stack}`);
  res.status(500).json({ 
    status: 'error',
    message: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});