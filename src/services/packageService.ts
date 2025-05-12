import { packageRepository, branchRepository } from "../repositories";
import { Package } from "../repositories/interfaces";
import { NotFoundError, BadRequestError } from "../utils/errors";
import logger from "../utils/logger";
import db from "../lib/db";

/**
 * Service for package-related business logic
 */
class PackageService {
  /**
   * Create a new package with validation
   */
  async createPackage(packageData: Partial<Package>): Promise<Package> {
    // Generate a unique tracking number
    const trackingNumber = this.generateTrackingNumber();

    // Validate branches
    const originBranch = await branchRepository.findById(
      packageData.origin_branch_id!
    );
    if (!originBranch) {
      throw new NotFoundError("Origin branch not found");
    }

    const destinationBranch = await branchRepository.findById(
      packageData.destination_branch_id!
    );
    if (!destinationBranch) {
      throw new NotFoundError("Destination branch not found");
    }

    // Create the package with transaction support
    return packageRepository.transaction(async (trx) => {
      const newPackage = await packageRepository.create({
        ...packageData,
        tracking_number: trackingNumber,
        status: "Pending",
      });

      logger.info(
        `New package created with tracking number: ${trackingNumber}`
      );

      return newPackage;
    });
  }

  /**
   * Track a package by its tracking number
   */
  async trackPackage(trackingNumber: string): Promise<any> {
    const pkg = await packageRepository.findByTrackingNumber(trackingNumber);
    if (!pkg) {
      throw new NotFoundError("Package not found");
    }

    // Get detailed information with branch data
    const [packageWithDetails] = await db("packages as p")
      .select(
        "p.*",
        "ob.name as origin_branch_name",
        "ob.city as origin_city",
        "ob.province as origin_province",
        "db.name as destination_branch_name",
        "db.city as destination_city",
        "db.province as destination_province"
      )
      .join("branches as ob", "p.origin_branch_id", "ob.id")
      .join("branches as db", "p.destination_branch_id", "db.id")
      .where("p.tracking_number", trackingNumber);

    return packageWithDetails;
  }

  /**
   * Update package status with validation and logging
   */
  async updatePackageStatus(
    id: number,
    status: "Pending" | "In Transit" | "Delivered" | "Cancelled" | "Returned",
    notes?: string
  ): Promise<Package | null> {
    const pkg = await packageRepository.findById(id);
    if (!pkg) {
      throw new NotFoundError("Package not found");
    }

    // Validate status transitions
    this.validateStatusTransition(pkg.status, status);

    // Update the status
    const updatedPackage = await packageRepository.updateStatus(id, status);

    // Log the status change
    logger.info(
      `Package ${pkg.tracking_number} status changed from ${pkg.status} to ${status}`
    );

    return updatedPackage;
  }

  /**
   * Generate dashboard statistics for packages
   */
  async getPackageStatistics(): Promise<any> {
    try {
      // Get counts by status
      const statusCounts = await db("packages")
        .select("status")
        .count("id as count")
        .groupBy("status");

      // Get counts by day for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dailyCounts = await db("packages")
        .select(db.raw("DATE(created_at) as date"))
        .count("id as count")
        .where("created_at", ">=", thirtyDaysAgo)
        .groupBy("date")
        .orderBy("date", "asc");

      // Get top 5 busiest origin branches
      const topOriginBranches = await db("packages as p")
        .select("b.name", "b.city")
        .count("p.id as package_count")
        .join("branches as b", "p.origin_branch_id", "b.id")
        .groupBy("b.id")
        .orderBy("package_count", "desc")
        .limit(5);

      return {
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr.status] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        dailyCounts,
        topOriginBranches,
      };
    } catch (error) {
      logger.error(`Error getting package statistics: ${error}`);
      throw error;
    }
  }

  /**
   * Search packages by tracking number, sender, receiver
   */
  async searchPackages(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    return packageRepository.searchPackages(searchTerm, page, limit);
  }

  /**
   * Generate a unique tracking number
   */
  private generateTrackingNumber(): string {
    const prefix = "PKG";
    const timestamp = Date.now().toString().substr(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Validate package status transitions
   */
  private validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): void {
    // Define valid status transitions
    const validTransitions: Record<string, string[]> = {
      Pending: ["In Transit", "Cancelled"],
      "In Transit": ["Delivered", "Returned"],
      Delivered: ["Returned"],
      Cancelled: [],
      Returned: [],
    };

    // Check if transition is valid
    if (
      !validTransitions[currentStatus].includes(newStatus) &&
      currentStatus !== newStatus
    ) {
      throw new BadRequestError(
        `Cannot change status from ${currentStatus} to ${newStatus}`
      );
    }
  }
}

export default new PackageService();
