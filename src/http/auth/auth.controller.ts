import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../../lib/db";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors";

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

export const register = async (req: Request) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await db("users").where({ email }).first();
  if (existingUser) {
    throw new BadRequestError("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const [userId] = await db("users").insert({
    name,
    email,
    password: hashedPassword,
    role_id: 1,
  });

  // Generate JWT token
  const payload = { id: userId };
  const token = jwt.sign(payload, JWT_SECRET);

  // Return data (will be sent as success response)
  return {
    statusCode: 201, // Created status
    message: "User registered successfully",
    result: {
      token,
      id: userId,
      name,
      email,
    },
  };
};

export const login = async (req: Request) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await db("users").where({ email }).first();
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // Generate token
  const payload = { id: user.id };
  const token = jwt.sign(payload, JWT_SECRET);

  // Return data (will be sent as success response)
  return {
    message: "Login successful",
    result: {
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  };
};

export const getProfile = async (req: Request) => {
  // The user ID comes from the JWT verification middleware
  const userId = req.user?.id;

  const user = await db("users")
    .where({ id: userId })
    .select("id", "name", "email", "created_at")
    .first();

  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Return data (will be sent as success response)
  return {
    message: "Profile retrieved successfully",
    result: user,
  };
};
