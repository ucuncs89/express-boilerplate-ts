import BaseRepository from "../lib/BaseRepository";
import { User } from "../lib/interfaces";
import { NotFoundError } from "../utils/errors";

export default class UserRepository extends BaseRepository<User> {
  constructor() {
    super("users");
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email });
  }

  /**
   * Find users by role
   */
  async findByRole(
    roleId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: User[]; pagination: any }> {
    return this.findAll({ role_id: roleId }, page, limit);
  }

  /**
   * Update user password
   */
  async updatePassword(
    id: number,
    hashedPassword: string
  ): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.update(id, { password: hashedPassword });
  }

  /**
   * Get users with their role information
   * This demonstrates a more complex query with a join
   */
  async getUsersWithRoles(
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: any[]; pagination: any }> {
    try {
      // Count total for pagination
      const [{ total }] = await this.db("users").count("users.id as total");

      // Calculate offset and total pages
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(Number(total) / limit);

      // Query with join
      const data = await this.db("users")
        .select(
          "users.id",
          "users.name",
          "users.email",
          "users.is_active",
          "users.created_at",
          "users.updated_at",
          "roles.id as role_id",
          "roles.name as role_name"
        )
        .join("roles", "users.role_id", "roles.id")
        .orderBy("users.id", "asc")
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
}
