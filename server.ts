import dotenv from "dotenv";
import app from "./app.js";
import { initDatabase } from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await initDatabase();
    console.log("Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
