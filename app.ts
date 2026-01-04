import express from "express";
import productRoutes from "./routes/products.routes.js";

const app = express();

app.use(express.json());

// Routes
app.use("/api", productRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
