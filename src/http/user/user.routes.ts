import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { controller } from "../../utils/request-handler";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./user.controller";

const router = Router();

// Protected routes - all user routes require authentication
router.use(authMiddleware);

router.get("/", controller(getAllUsers));
router.get("/:id", controller(getUserById));
router.post("/", controller(createUser));
router.put("/:id", controller(updateUser));
router.delete("/:id", controller(deleteUser));

export default router;
