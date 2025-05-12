import BaseRepository from "../lib/BaseRepository";
import { Branch } from "../lib/interfaces";

export default class BranchRepository extends BaseRepository<Branch> {
  constructor() {
    super("branches");
  }

  /**
   * Find branches by city
   */
  async findByCity(city: string): Promise<Branch[]> {
    try {
      return await this.db(this.tableName)
        .where("city", "like", `%${city}%`)
        .orderBy("name", "asc");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find branches by province
   */
  async findByProvince(province: string): Promise<Branch[]> {
    try {
      return await this.db(this.tableName)
        .where("province", "like", `%${province}%`)
        .orderBy("name", "asc");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get statistics on packages by branch
   */
  async getBranchesWithPackageStats(): Promise<any[]> {
    try {
      return await this.db("branches as b")
        .select("b.id", "b.name", "b.city", "b.province")
        .select(
          this.db.raw(`
          COUNT(CASE WHEN p.origin_branch_id = b.id THEN 1 ELSE NULL END) as packages_sent,
          COUNT(CASE WHEN p.destination_branch_id = b.id THEN 1 ELSE NULL END) as packages_received
        `)
        )
        .leftJoin("packages as p", function () {
          this.on("p.origin_branch_id", "=", "b.id").orOn(
            "p.destination_branch_id",
            "=",
            "b.id"
          );
        })
        .where("b.is_active", true)
        .groupBy("b.id")
        .orderBy("b.name", "asc");
    } catch (error) {
      throw error;
    }
  }
}
