import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { uploadAsset } from "../controllers/asset.controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware.js";
import { config } from "../config/index.js";
import { sendError } from "../utils/response.util.js";
import { ErrorCode, HttpStatus } from "../types/response.types.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.assets.maxFileSizeMb * 1024 * 1024,
  },
});

const uploadImage = (req: Request, res: Response, next: NextFunction): void => {
  upload.single("image")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      sendError(
        res,
        error.code === "LIMIT_FILE_SIZE"
          ? `Image must be smaller than ${config.assets.maxFileSizeMb}MB`
          : error.message,
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
      );
      return;
    }

    if (error) {
      next(error);
      return;
    }

    next();
  });
};

router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadImage,
  uploadAsset,
);

export default router;
