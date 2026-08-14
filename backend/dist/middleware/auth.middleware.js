"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const jwtSecret = process.env.JWT_SECRET;
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token || !jwtSecret) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, jwtSecret);
        const userId = Number(payload.sub);
        if (!Number.isInteger(userId)) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
        };
        return next();
    }
    catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
exports.authMiddleware = authMiddleware;
