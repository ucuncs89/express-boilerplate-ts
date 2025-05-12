import { Knex } from "knex";
import db from "./db";
import logger from "../utils/logger";

/**
 * Base Repository class that provides common CRUD operations
 * This will be extended by specific entity repositories
 */
export default abstract class BaseRepository<T> {
  protected db: Knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  /**
   * Find all records with optional filtering and pagination
   */
  async findAll(
    filters: Record<string, any> = {},
    page: number = 1,
    limit: number = 10,
    orderBy: string = "id",
    orderDirection: "asc" | "desc" = "asc"
  ): Promise<{
    data: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      // Build the query
      const query = this.db(this.tableName)
        .where(filters)
        .orderBy(orderBy, orderDirection);

      // Count total records for pagination
      const countQuery = this.db(this.tableName)
        .where(filters)
        .count("* as total");
      const [{ total }] = await countQuery;

      // Apply pagination
      const offset = (page - 1) * limit;
      const data = await query.offset(offset).limit(limit);

      // Calculate total pages
      const totalPages = Math.ceil(Number(total) / limit);

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
      logger.error(`Error in ${this.tableName} findAll: ${error}`);
      throw error;
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: number): Promise<T | null> {
    try {
      const result = await this.db(this.tableName).where({ id }).first();
      return result || null;
    } catch (error) {
      logger.error(`Error in ${this.tableName} findById: ${error}`);
      throw error;
    }
  }

  /**
   * Find a single record by filter
   */
  async findOne(filter: Record<string, any>): Promise<T | null> {
    try {
      const result = await this.db(this.tableName).where(filter).first();
      return result || null;
    } catch (error) {
      logger.error(`Error in ${this.tableName} findOne: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      const [id] = await this.db(this.tableName).insert(data);
      const created = await this.findById(id);
      return created as T;
    } catch (error) {
      logger.error(`Error in ${this.tableName} create: ${error}`);
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: number, data: Partial<T>): Promise<T | null> {
    try {
      await this.db(this.tableName)
        .where({ id })
        .update({
          ...data,
          updated_at: this.db.fn.now(),
        });
      return this.findById(id);
    } catch (error) {
      logger.error(`Error in ${this.tableName} update: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: number): Promise<boolean> {
    try {
      const deleted = await this.db(this.tableName).where({ id }).delete();
      return deleted > 0;
    } catch (error) {
      logger.error(`Error in ${this.tableName} delete: ${error}`);
      throw error;
    }
  }

  /**
   * Get count of records with optional filtering
   */
  async count(filters: Record<string, any> = {}): Promise<number> {
    try {
      const [{ count }] = await this.db(this.tableName)
        .where(filters)
        .count("* as count");
      return Number(count);
    } catch (error) {
      logger.error(`Error in ${this.tableName} count: ${error}`);
      throw error;
    }
  }

  /**
   * Execute custom query with transaction support
   */
  async transaction<R>(
    callback: (trx: Knex.Transaction) => Promise<R>
  ): Promise<R> {
    return this.db.transaction(callback);
  }
}
