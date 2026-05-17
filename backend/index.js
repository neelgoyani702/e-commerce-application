import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./db/index.js";
import mongoose from "mongoose";

connectDB().then(() => {
  console.log("Database connected");

  const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
  });

  // ECS sends SIGTERM before terminating the container during rolling deploys.
  // Finish in-flight requests, then close the DB connection cleanly.
  process.on("SIGTERM", () => {
    console.log("SIGTERM received — shutting down gracefully");
    server.close(() => {
      mongoose.connection.close().then(() => {
        console.log("Database connection closed");
        process.exit(0);
      });
    });
  });
});

