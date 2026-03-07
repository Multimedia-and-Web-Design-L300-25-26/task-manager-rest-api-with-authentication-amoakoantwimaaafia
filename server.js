import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server only after connection
connectDB()
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    console.error("Please check your MONGO_URI in .env file");
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err);
  process.exit(1);
});