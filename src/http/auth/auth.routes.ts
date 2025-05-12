import { Router } from "express";
import { register, login, getProfile } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { registerValidation, loginValidation } from "./auth.validation";
import { controller } from "../../utils/request-handler";

const router = Router();

// Public routes
router.post("/register", validate(registerValidation), controller(register));
router.post("/login", validate(loginValidation), controller(login));

// Protected routes
router.get("/profile", authMiddleware, controller(getProfile));

export default router;
