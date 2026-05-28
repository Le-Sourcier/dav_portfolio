import Experience from '../models/Experience.js';
import { IExperience } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';
import { publicVisibilityWhere } from '../utils/publication.js';

class ExperienceService {
  async findAll(publicOnly = false): Promise<IExperience[]> {
    const experiences = await Experience.findAll({
      where: publicOnly ? publicVisibilityWhere() : {},
      order: [['createdAt', 'DESC']],
    });
    return experiences;
  }

  async findById(id: string, publicOnly = false): Promise<IExperience> {
    const experience = await Experience.findOne({
      where: { id, ...(publicOnly ? publicVisibilityWhere() : {}) },
    });
    if (!experience) {
      throw new AppError('Experience not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return experience;
  }

  async create(data: Omit<IExperience, 'id' | 'createdAt' | 'updatedAt'>): Promise<IExperience> {
    const experience = await Experience.create(data);
    return experience;
  }

  async update(id: string, data: Partial<IExperience>): Promise<IExperience> {
    const experience = await Experience.findByPk(id);
    if (!experience) {
      throw new AppError('Experience not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await experience.update(data);
    return experience;
  }

  async delete(id: string): Promise<void> {
    const experience = await Experience.findByPk(id);
    if (!experience) {
      throw new AppError('Experience not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await experience.destroy();
  }
}

export const experienceService = new ExperienceService();
export default experienceService;
