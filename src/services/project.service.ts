import Project from '../models/Project.js';
import { IProject } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';

class ProjectService {
  async findAll(): Promise<IProject[]> {
    const projects = await Project.findAll({
      order: [['createdAt', 'DESC']],
    });
    return projects;
  }

  async findById(id: string): Promise<IProject> {
    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return project;
  }

  async findBySlug(slug: string): Promise<IProject> {
    const project = await Project.findOne({ where: { slug } });
    if (!project) {
      throw new AppError('Project not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return project;
  }

  async create(data: Omit<IProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<IProject> {
    const project = await Project.create(data);
    return project;
  }

  async update(id: string, data: Partial<IProject>): Promise<IProject> {
    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await project.update(data);
    return project;
  }

  async delete(id: string): Promise<void> {
    const project = await Project.findByPk(id);
    if (!project) {
      throw new AppError('Project not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await project.destroy();
  }

  async findByCategory(category: string): Promise<IProject[]> {
    const projects = await Project.findAll({
      where: { category },
      order: [['createdAt', 'DESC']],
    });
    return projects;
  }
}

export const projectService = new ProjectService();
export default projectService;
