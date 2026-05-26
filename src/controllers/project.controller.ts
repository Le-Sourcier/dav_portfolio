import { Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service.js';
import { revalidationService } from '../services/revalidation.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export const getAllProjects = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await projectService.findAll();
    sendSuccess(res, projects, 'Projects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.findById(req.params.id!);
    sendSuccess(res, project, 'Project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.findBySlug(req.params.slug!);
    sendSuccess(res, project, 'Project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.create(req.body);
    void revalidationService.revalidate({ tags: ['projects', `project:${project.slug}`] });
    sendCreated(res, project, 'Project created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.update(req.params.id!, req.body);
    void revalidationService.revalidate({ tags: ['projects', `project:${project.slug}`] });
    sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.findById(req.params.id!);
    await projectService.delete(req.params.id!);
    void revalidationService.revalidate({ tags: ['projects', `project:${project.slug}`] });
    sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllProjects,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
};
