import { Request, Response, NextFunction } from "express";
import { userRepository, roleRepository } from "../../repositories";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../utils/errors";
import { ControllerFunction } from "../../utils/types";
import logger from "../../utils/logger";

/**
 * Get all users with pagination
 */
export const getAllUsers: ControllerFunction = async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const usersWithRoles = await userRepository.getUsersWithRoles(page, limit);

  return {
    message: "Users retrieved successfully",
    result: usersWithRoles.data,
    pagination: usersWithRoles.pagination,
  };
};

/**
 * Get user by ID
 */
export const getUserById: ControllerFunction = async (req, res) => {
  const userId = parseInt(req.params.id);

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }

  return {
    message: "User retrieved successfully",
    result: user,
  };
};

/**
 * Create new user
 */
export const createUser: ControllerFunction = async (req, res) => {
  const { name, email, password, role_id } = req.body;

  // Check if email already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError("Email already in use");
  }

  // Check if role exists
  const role = await roleRepository.findById(role_id);
  if (!role) {
    throw new ValidationError("Invalid role_id", {
      role_id: ["The specified role does not exist"],
    });
  }

  // In a real application, you would hash the password before saving
  const newUser = await userRepository.create({
    name,
    email,
    password, // In production, this should be hashed
    role_id,
    is_active: true,
  });

  logger.info(`User created: ${newUser.name} (${newUser.email})`);

  return {
    message: "User created successfully",
    result: newUser,
    statusCode: 201,
  };
};

/**
 * Update user
 */
export const updateUser: ControllerFunction = async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email, role_id, is_active } = req.body;

  // Check if user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }

  // If changing email, check if it's already in use
  if (email && email !== user.email) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }
  }

  // If changing role, check if new role exists
  if (role_id && role_id !== user.role_id) {
    const role = await roleRepository.findById(role_id);
    if (!role) {
      throw new ValidationError("Invalid role_id", {
        role_id: ["The specified role does not exist"],
      });
    }
  }

  // Update user
  const updatedUser = await userRepository.update(userId, {
    name,
    email,
    role_id,
    is_active,
  });

  return {
    message: "User updated successfully",
    result: updatedUser,
  };
};

/**
 * Delete user
 */
export const deleteUser: ControllerFunction = async (req, res) => {
  const userId = parseInt(req.params.id);

  // Check if user exists
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }

  await userRepository.delete(userId);

  return {
    message: "User deleted successfully",
  };
};
