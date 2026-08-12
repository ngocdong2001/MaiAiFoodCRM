import "dotenv/config";
import express from "express";
import cors from "cors";
import infoRouter from "./routes/info.route";
import authRouter from "./routes/auth.route";
import revenueRouter from "./routes/revenue.route";
import staffRouter from "./routes/staff.route";
import crmRouter from "./routes/crm.route";
import calendarRouter from "./routes/calendar.route";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/info", infoRouter);
app.use("/api/auth", authRouter);
app.use("/api/revenue", revenueRouter);
app.use("/api/staff", staffRouter);
app.use("/api/crm", crmRouter);
app.use("/api/calendar", calendarRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
