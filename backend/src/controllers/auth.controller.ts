import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

import { getPrismaMaster } from "../lib/prisma-master.js";

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] | undefined) ?? "7d";

const toAuthUser = (user: {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
});

export const login = async (req: Request, res: Response) => {
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
    const prismaMaster = getPrismaMaster();
    
    const user = await prismaMaster.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.isActive || !user.tenant?.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(
      candidatePassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn },
    );

    await prismaMaster.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return res.status(200).json({
      token,
      user: toAuthUser(user),
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      },
    });
  } catch (error) {
    console.error("Login failed", error);
    return res.status(500).json({ message: "Unable to process login" });
  }
};

export const me = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({ user: req.user });
};

export const updateProfile = async (req: Request, res: Response) => {
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
    const emailOwner = await prisma.user.findFirst({
      where: { email, id: { not: req.user.id } },
      select: { id: true },
    });
    if (emailOwner) {
      return res.status(409).json({ message: "Email is already in use" });
    }

    const user = await prisma.user.update({
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
  } catch (error) {
    console.error("Profile update failed", error);
    return res.status(500).json({ message: "Unable to update profile" });
  }
};
