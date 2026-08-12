"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const info_route_1 = __importDefault(require("./routes/info.route"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const revenue_route_1 = __importDefault(require("./routes/revenue.route"));
const staff_route_1 = __importDefault(require("./routes/staff.route"));
const crm_route_1 = __importDefault(require("./routes/crm.route"));
const calendar_route_1 = __importDefault(require("./routes/calendar.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/info", info_route_1.default);
app.use("/api/auth", auth_route_1.default);
app.use("/api/revenue", revenue_route_1.default);
app.use("/api/staff", staff_route_1.default);
app.use("/api/crm", crm_route_1.default);
app.use("/api/calendar", calendar_route_1.default);
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
