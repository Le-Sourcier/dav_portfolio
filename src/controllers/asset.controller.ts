import { Request, Response, NextFunction } from "express";
import AssetService from "../services/asset.service.js";
import { sendCreated, sendError } from "../utils/response.util.js";
import { ErrorCode, HttpStatus } from "../types/response.types.js";

/**
 * Messages d'erreur du service qui relèvent d'un échec serveur (FTP HS,
 * config manquante, fausse réussite détectée) plutôt que d'une mauvaise
 * requête cliente. On répond 500 pour ne pas faire croire au front que
 * c'est un fichier invalide.
 */
const SERVER_ERROR_HINTS = ["configured", "FTP upload", "size mismatch"];

const isServerError = (message: string): boolean =>
  SERVER_ERROR_HINTS.some((hint) => message.includes(hint));

export const uploadAsset = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const asset = await AssetService.uploadImage(
      req.file,
      typeof req.body.scope === "string" ? req.body.scope : undefined,
    );

    sendCreated(res, asset, "Asset uploaded successfully");
  } catch (error) {
    if (error instanceof Error) {
      const isServer = isServerError(error.message);
      sendError(
        res,
        error.message,
        isServer ? ErrorCode.INTERNAL_ERROR : ErrorCode.VALIDATION_ERROR,
        isServer ? HttpStatus.INTERNAL_SERVER_ERROR : HttpStatus.BAD_REQUEST,
      );
      return;
    }

    next(error);
  }
};

export default { uploadAsset };
