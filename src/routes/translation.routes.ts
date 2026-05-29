import { Router } from "express";
import { translateFields } from "../controllers/translation.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, translateFields);

export default router;
