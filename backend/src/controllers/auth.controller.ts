import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";

import { prisma } from "../lib/prisma";

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] | undefined) ?? "7d";

const toAuthUser = (user: {
  id: number;
  name: string;
  email: string;
  role: string;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
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
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.isActive) {
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
        sub: String(user.id),
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn },
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return res.status(200).json({
      token,
      user: toAuthUser(user),
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
