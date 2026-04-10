import { Request, Response, NextFunction } from 'express';
import { experienceService } from '../services/experience.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export const getAllExperiences = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experiences = await experienceService.findAll();
    sendSuccess(res, experiences, 'Experiences retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getExperienceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experience = await experienceService.findById(req.params.id!);
    sendSuccess(res, experience, 'Experience retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experience = await experienceService.create(req.body);
    sendCreated(res, experience, 'Experience created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const experience = await experienceService.update(req.params.id!, req.body);
    sendSuccess(res, experience, 'Experience updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await experienceService.delete(req.params.id!);
    sendSuccess(res, null, 'Experience deleted successfully');
  } catch (error) {
    next(error);
  }
};

export default { getAllExperiences, getExperienceById, createExperience, updateExperience, deleteExperience };
