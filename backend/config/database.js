const mongoose = require("mongoose");
const logger = require("./logger");

require("dotenv").config();


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Corrected option name
      family: 4, // Use IPv4, remove if using IPv6
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("connected", () =>
      logger.info("MongoDB connection established")
    );

    mongoose.connection.on("disconnected", () =>
      logger.warn("MongoDB connection closed")
    );

    mongoose.connection.on("error", (err) =>
      logger.error(`MongoDB error: ${err}`)
    );
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;