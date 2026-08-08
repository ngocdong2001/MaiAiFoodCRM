import "dotenv/config";
import express from "express";
import cors from "cors";
import infoRouter from "./routes/info.route";
import authRouter from "./routes/auth.route";
import revenueRouter from "./routes/revenue.route";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/info", infoRouter);
app.use("/api/auth", authRouter);
app.use("/api/revenue", revenueRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
