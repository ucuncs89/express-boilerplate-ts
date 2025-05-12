import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { controller } from "../../utils/requestHandler";
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackageStatus,
  trackPackage,
  searchPackages,
  getPackageStatistics,
} from "./package.controller";

const router = Router();

// Public routes
router.get("/track/:trackingNumber", controller(trackPackage));

// Protected routes
router.use(authMiddleware);

router.get("/", controller(getPackages));
router.get("/search", controller(searchPackages));
router.get("/statistics", controller(getPackageStatistics));
router.get("/:id", controller(getPackageById));
router.post("/", controller(createPackage));
router.put("/:id/status", controller(updatePackageStatus));

export default router;
