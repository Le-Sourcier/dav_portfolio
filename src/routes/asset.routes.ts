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

/**
 * @swagger
 * /assets/upload:
 *   post:
 *     summary: Upload une image (cover de blog/projet/expérience)
 *     description: |
 *       Reçoit une image multipart, la convertit en WebP optimisé via Sharp,
 *       puis la pousse en FTP vers le bucket public. Renvoie l'URL publique
 *       finale du fichier ainsi que ses métadonnées.
 *
 *       Erreurs courantes :
 *       - 400 : fichier manquant, type MIME non supporté, fichier trop gros
 *       - 500 : FTP non configuré, transfert FTP refusé, taille distante incohérente
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               scope:
 *                 type: string
 *                 enum: [blog, projects, experiences, general]
 *                 default: general
 *     responses:
 *       201:
 *         description: Image uploadée avec succès
 *       400:
 *         description: Requête invalide (fichier manquant ou non supporté)
 *       500:
 *         description: Erreur serveur (FTP indisponible ou transfert incomplet)
 */
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadImage,
  uploadAsset,
);

export default router;
