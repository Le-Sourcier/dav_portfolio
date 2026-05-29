import { Request, Response, NextFunction } from "express";
import AssetService from "../services/asset.service.js";
import { sendCreated, sendError } from "../utils/response.util.js";
import { ErrorCode, HttpStatus } from "../types/response.types.js";

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
      sendError(
        res,
        error.message,
        ErrorCode.VALIDATION_ERROR,
        error.message.includes("configured")
          ? HttpStatus.INTERNAL_SERVER_ERROR
          : HttpStatus.BAD_REQUEST,
      );
      return;
    }

    next(error);
  }
};

export default { uploadAsset };
