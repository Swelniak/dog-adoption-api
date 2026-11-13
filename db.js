const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Tests use their own database so they never touch real data
    const dbName =
      process.env.NODE_ENV === "test"
        ? `${process.env.DB_NAME}Test`
        : process.env.DB_NAME;

    await mongoose.connect(process.env.MONGODB_URI, { dbName });
    console.log("connected to MongoDB");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;