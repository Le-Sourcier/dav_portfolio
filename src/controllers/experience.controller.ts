import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { experienceService } from '../services/experience.service.js';
import { revalidationService } from '../services/revalidation.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

function isValidAdminToken(req: Request): boolean {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  try {
    jwt.verify(header.slice(7), config.jwt.secret);
    return true;
  } catch {
    return false;
  }
}

export const getAllExperiences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experiences = await experienceService.findAll(!isValidAdminToken(req));
    sendSuccess(res, experiences, 'Experiences retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAllAdminExperiences = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experiences = await experienceService.findAll(false);
    sendSuccess(res, experiences, 'Experiences retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminExperienceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experience = await experienceService.findById(req.params.id!, false);
    sendSuccess(res, experience, 'Experience retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getExperienceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experience = await experienceService.findById(req.params.id!, !isValidAdminToken(req));
    sendSuccess(res, experience, 'Experience retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experience = await experienceService.create(req.body);
    void revalidationService.revalidate({ tags: ['experiences', `experience:${experience.id}`] });
    sendCreated(res, experience, 'Experience created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experience = await experienceService.update(req.params.id!, req.body);
    void revalidationService.revalidate({ tags: ['experiences', `experience:${experience.id}`] });
    sendSuccess(res, experience, 'Experience updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experience = await experienceService.findById(req.params.id!);
    await experienceService.delete(req.params.id!);
    void revalidationService.revalidate({ tags: ['experiences', `experience:${experience.id}`] });
    sendSuccess(res, null, 'Experience deleted successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllExperiences,
  getAllAdminExperiences,
  getExperienceById,
  getAdminExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
};
