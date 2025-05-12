import BaseRepository from "../lib/base.respository";
import { Package } from "../lib/interfaces";
import { NotFoundError } from "../utils/errors";

export default class PackageRepository extends BaseRepository<Package> {
  constructor() {
    super("packages");
  }

  /**
   * Find package by tracking number
   */
  async findByTrackingNumber(trackingNumber: string): Promise<Package | null> {
    return this.findOne({ tracking_number: trackingNumber });
  }

  /**
   * Get packages by status
   */
  async findByStatus(
    status: "Pending" | "In Transit" | "Delivered" | "Cancelled" | "Returned",
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Package[]; pagination: any }> {
    return this.findAll({ status }, page, limit);
  }

  /**
   * Update package status
   */
  async updateStatus(
    id: number,
    status: "Pending" | "In Transit" | "Delivered" | "Cancelled" | "Returned"
  ): Promise<Package | null> {
    const pkg = await this.findById(id);
    if (!pkg) {
      throw new NotFoundError("Package not found");
    }

    return this.update(id, { status });
  }

  /**
   * Get packages with branch information
   */
  async getPackagesWithBranchInfo(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: any[]; pagination: any }> {
    try {
      // Count total for pagination
      const [{ total }] = await this.db("packages").count(
        "packages.id as total"
      );

      // Calculate offset and total pages
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(Number(total) / limit);

      // Execute query with joins
      const data = await this.db("packages as p")
        .select(
          "p.id",
          "p.tracking_number",
          "p.sender_name",
          "p.receiver_name",
          "p.weight_kg",
          "p.volume_cm3",
          "p.price",
          "p.status",
          "p.created_at",
          "ob.id as origin_branch_id",
          "ob.name as origin_branch_name",
          "ob.city as origin_city",
          "db.id as destination_branch_id",
          "db.name as destination_branch_name",
          "db.city as destination_city"
        )
        .join("branches as ob", "p.origin_branch_id", "ob.id")
        .join("branches as db", "p.destination_branch_id", "db.id")
        .orderBy("p.created_at", "desc")
        .offset(offset)
        .limit(limit);

      return {
        data,
        pagination: {
          total: Number(total),
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search packages by various criteria
   */
  async searchPackages(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: any[]; pagination: any }> {
    try {
      // Build query for searching
      const query = this.db("packages as p")
        .select(
          "p.id",
          "p.tracking_number",
          "p.sender_name",
          "p.receiver_name",
          "p.status",
          "p.created_at",
          "ob.name as origin_branch_name",
          "db.name as destination_branch_name"
        )
        .join("branches as ob", "p.origin_branch_id", "ob.id")
        .join("branches as db", "p.destination_branch_id", "db.id")
        .where(function () {
          this.where("p.tracking_number", "like", `%${searchTerm}%`)
            .orWhere("p.sender_name", "like", `%${searchTerm}%`)
            .orWhere("p.receiver_name", "like", `%${searchTerm}%`)
            .orWhere("p.sender_address", "like", `%${searchTerm}%`)
            .orWhere("p.receiver_address", "like", `%${searchTerm}%`)
            .orWhere("ob.name", "like", `%${searchTerm}%`)
            .orWhere("db.name", "like", `%${searchTerm}%`);
        })
        .orderBy("p.created_at", "desc");

      // Count total for pagination
      const countQuery = this.db("packages as p")
        .count("p.id as total")
        .join("branches as ob", "p.origin_branch_id", "ob.id")
        .join("branches as db", "p.destination_branch_id", "db.id")
        .where(function () {
          this.where("p.tracking_number", "like", `%${searchTerm}%`)
            .orWhere("p.sender_name", "like", `%${searchTerm}%`)
            .orWhere("p.receiver_name", "like", `%${searchTerm}%`)
            .orWhere("p.sender_address", "like", `%${searchTerm}%`)
            .orWhere("p.receiver_address", "like", `%${searchTerm}%`)
            .orWhere("ob.name", "like", `%${searchTerm}%`)
            .orWhere("db.name", "like", `%${searchTerm}%`);
        });

      const [{ total }] = await countQuery;

      // Apply pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(Number(total) / limit);
      const data = await query.offset(offset).limit(limit);

      return {
        data,
        pagination: {
          total: Number(total),
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
