import BaseRepository from "../lib/BaseRepository";
import { Role } from "../lib/interfaces";

export default class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super("roles");
  }

  /**
   * Find role by name
   */
  async findByName(name: string): Promise<Role | null> {
    return this.findOne({ name });
  }

  /**
   * Get role with user count
   */
  async getRolesWithUserCount(): Promise<any[]> {
    try {
      return await this.db("roles")
        .select(
          "roles.id",
          "roles.name",
          "roles.description",
          "roles.created_at",
          "roles.updated_at"
        )
        .select(this.db.raw("COUNT(users.id) as user_count"))
        .leftJoin("users", "roles.id", "users.role_id")
        .groupBy("roles.id")
        .orderBy("roles.id", "asc");
    } catch (error) {
      throw error;
    }
  }
}
