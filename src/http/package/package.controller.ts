import { Request, Response } from "express";
import { ControllerFunction } from "../../utils/types";
import { NotFoundError, ValidationError } from "../../utils/errors";
import packageService from "../../services/package.service";
import { packageRepository } from "../../repositories";

/**
 * Get packages with pagination
 */
export const getPackages: ControllerFunction = async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await packageRepository.getPackagesWithBranchInfo(page, limit);

  return {
    message: "Packages retrieved successfully",
    result: result.data,
    pagination: result.pagination,
  };
};

/**
 * Get package by ID
 */
export const getPackageById: ControllerFunction = async (req, res) => {
  const packageId = parseInt(req.params.id);

  const pkg = await packageRepository.findById(packageId);
  if (!pkg) {
    throw new NotFoundError(`Package with ID ${packageId} not found`);
  }

  return {
    message: "Package retrieved successfully",
    result: pkg,
  };
};

/**
 * Track package by tracking number
 */
export const trackPackage: ControllerFunction = async (req, res) => {
  const { trackingNumber } = req.params;

  if (!trackingNumber) {
    throw new ValidationError("Tracking number is required");
  }

  const packageDetails = await packageService.trackPackage(trackingNumber);

  return {
    message: "Package tracked successfully",
    result: packageDetails,
  };
};

/**
 * Create new package
 */
export const createPackage: ControllerFunction = async (req, res) => {
  const packageData = req.body;

  // Required fields validation
  const requiredFields = [
    "sender_name",
    "receiver_name",
    "sender_address",
    "receiver_address",
    "origin_branch_id",
    "destination_branch_id",
    "weight_kg",
    "volume_cm3",
    "price",
  ];

  const missingFields = requiredFields.filter((field) => !packageData[field]);
  if (missingFields.length > 0) {
    const errors = missingFields.reduce((acc, field) => {
      acc[field] = ["This field is required"];
      return acc;
    }, {} as Record<string, string[]>);

    throw new ValidationError("Missing required fields", errors);
  }

  const newPackage = await packageService.createPackage(packageData);

  return {
    message: "Package created successfully",
    result: newPackage,
    statusCode: 201,
  };
};

/**
 * Update package status
 */
export const updatePackageStatus: ControllerFunction = async (req, res) => {
  const packageId = parseInt(req.params.id);
  const { status, notes } = req.body;

  if (!status) {
    throw new ValidationError("Status is required");
  }

  const validStatuses = [
    "Pending",
    "In Transit",
    "Delivered",
    "Cancelled",
    "Returned",
  ];
  if (!validStatuses.includes(status)) {
    throw new ValidationError("Invalid status value", {
      status: [`Status must be one of: ${validStatuses.join(", ")}`],
    });
  }

  const updatedPackage = await packageService.updatePackageStatus(
    packageId,
    status as any,
    notes
  );

  return {
    message: "Package status updated successfully",
    result: updatedPackage,
  };
};

/**
 * Search packages
 */
export const searchPackages: ControllerFunction = async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!q) {
    throw new ValidationError("Search query is required");
  }

  const results = await packageService.searchPackages(q as string, page, limit);

  return {
    message: "Search results",
    result: results.data,
    pagination: results.pagination,
  };
};

/**
 * Get package statistics for dashboard
 */
export const getPackageStatistics: ControllerFunction = async (req, res) => {
  const statistics = await packageService.getPackageStatistics();

  return {
    message: "Package statistics retrieved successfully",
    result: statistics,
  };
};
