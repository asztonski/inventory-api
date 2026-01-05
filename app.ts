import express from "express";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";

const app = express();

app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
