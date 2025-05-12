import UserRepository from "./UserRepository";
import RoleRepository from "./RoleRepository";
import BranchRepository from "./BranchRepository";
import PackageRepository from "./PackageRepository";

// Export interfaces
export * from "../lib/interfaces";

// Export repositories
export { UserRepository, RoleRepository, BranchRepository, PackageRepository };

// Create singleton instances
export const userRepository = new UserRepository();
export const roleRepository = new RoleRepository();
export const branchRepository = new BranchRepository();
export const packageRepository = new PackageRepository();

// Export default as object containing all repositories
export default {
  userRepository,
  roleRepository,
  branchRepository,
  packageRepository,
};
