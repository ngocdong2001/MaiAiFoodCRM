"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.me = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
const toAuthUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
});
const login = async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    if (!jwtSecret) {
        return res.status(500).json({ message: "JWT secret is not configured" });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const candidatePassword = String(password);
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(candidatePassword, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({
            sub: String(user.id),
            email: user.email,
            role: user.role,
        }, jwtSecret, { expiresIn: jwtExpiresIn });
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return res.status(200).json({
            token,
            user: toAuthUser(user),
        });
    }
    catch (error) {
        console.error("Login failed", error);
        return res.status(500).json({ message: "Unable to process login" });
    }
};
exports.login = login;
const me = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ user: req.user });
};
exports.me = me;
const updateProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
    const avatarUrl = typeof req.body?.avatarUrl === "string" ? req.body.avatarUrl.trim() : "";
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }
    try {
        const emailOwner = await prisma_1.prisma.user.findFirst({
            where: { email, id: { not: req.user.id } },
            select: { id: true },
        });
        if (emailOwner) {
            return res.status(409).json({ message: "Email is already in use" });
        }
        const user = await prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                name,
                email,
                phone: phone || null,
                avatarUrl: avatarUrl || null,
                updatedAt: new Date(),
            },
        });
        return res.status(200).json({ user: toAuthUser(user) });
    }
    catch (error) {
        console.error("Profile update failed", error);
        return res.status(500).json({ message: "Unable to update profile" });
    }
};
exports.updateProfile = updateProfile;
