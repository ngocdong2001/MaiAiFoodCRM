import "dotenv/config";
import express from "express";
import cors from "cors";
import infoRouter from "./routes/info.route";
import authRouter from "./routes/auth.route";
import tenantRouter from "./routes/tenant.route";
import revenueRouter from "./routes/revenue.route";
import staffRouter from "./routes/staff.route";
import crmRouter from "./routes/crm.route";
import calendarRouter from "./routes/calendar.route";
import { getPrismaMaster, disconnectPrismaMaster } from "./lib/prisma-master";
import { disconnectAllTenants } from "./lib/prisma-tenant";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Prisma Master connection on startup
async function initializePrisma() {
  try {
    const prismaMaster = getPrismaMaster();
    await prismaMaster.$connect();
    console.log("✅ Prisma Master connected");
  } catch (error) {
    console.error("❌ Failed to connect Prisma Master:", error);
    process.exit(1);
  }
}

// Routes
app.use("/api/info", infoRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin/tenants", tenantRouter);
app.use("/api/revenue", revenueRouter);
app.use("/api/staff", staffRouter);
app.use("/api/crm", crmRouter);
app.use("/api/calendar", calendarRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\n🛑 Shutting down gracefully...");
  try {
    await disconnectPrismaMaster();
    await disconnectAllTenants();
    console.log("✅ All database connections closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start server
const startServer = async () => {
  await initializePrisma();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();
