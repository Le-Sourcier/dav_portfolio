import { Request, Response, NextFunction } from "express";
import { translationService } from "../services/translation.service.js";
import { sendSuccess, sendValidationError } from "../utils/response.util.js";

export const translateFields = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { entity, sourceLocale, targetLocale, fields, instructions } = req.body || {};

    if (!["project", "blog", "experience", "settings"].includes(entity)) {
      sendValidationError(res, "Invalid entity");
      return;
    }

    if (!["fr", "en"].includes(sourceLocale) || !["fr", "en"].includes(targetLocale)) {
      sendValidationError(res, "Invalid locale");
      return;
    }

    if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
      sendValidationError(res, "Fields must be an object");
      return;
    }

    const result = await translationService.translate({
      entity,
      sourceLocale,
      targetLocale,
      fields,
      instructions: typeof instructions === "string" ? instructions : "",
    });

    sendSuccess(res, result, "Translation generated successfully");
  } catch (error) {
    next(error);
  }
};
