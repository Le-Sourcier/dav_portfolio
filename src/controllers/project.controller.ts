import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { projectService } from '../services/project.service.js';
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

export const getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await projectService.findAll(!isValidAdminToken(req));
    sendSuccess(res, projects, 'Projects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAllAdminProjects = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await projectService.findAll(false);
    sendSuccess(res, projects, 'Projects retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAdminProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.findById(req.params.id!, false);
    sendSuccess(res, project, 'Project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.findById(req.params.id!, !isValidAdminToken(req));
    sendSuccess(res, project, 'Project retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getProjectBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.findBySlug(req.params.slug!, !isValidAdminToken(req));
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
  getAllAdminProjects,
  getAdminProjectById,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
};
