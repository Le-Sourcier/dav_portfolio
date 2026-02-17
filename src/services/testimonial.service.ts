import Testimonial from '../models/Testimonial.js';
import { ITestimonial } from '../types/entities.types.js';
import { AppError } from '../middlewares/error.middleware.js';
import { ErrorCode, HttpStatus } from '../types/response.types.js';

class TestimonialService {
  async findAll(): Promise<ITestimonial[]> {
    const testimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']],
    });
    return testimonials;
  }

  async findVisible(): Promise<ITestimonial[]> {
    const testimonials = await Testimonial.findAll({
      where: { visible: true },
      order: [['createdAt', 'DESC']],
    });
    return testimonials;
  }

  async findById(id: string, visibleOnly = false): Promise<ITestimonial> {
    const where: Record<string, unknown> = { id };
    if (visibleOnly) where.visible = true;
    const testimonial = await Testimonial.findOne({ where });
    if (!testimonial) {
      throw new AppError('Testimonial not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }
    return testimonial;
  }

  async create(data: Omit<ITestimonial, 'id' | 'visible' | 'createdAt'>): Promise<ITestimonial> {
    const testimonial = await Testimonial.create({
      ...data,
      visible: true,
    });
    return testimonial;
  }

  async update(id: string, data: Partial<ITestimonial>): Promise<ITestimonial> {
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      throw new AppError('Testimonial not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await testimonial.update(data);
    return testimonial;
  }

  async delete(id: string): Promise<void> {
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      throw new AppError('Testimonial not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await testimonial.destroy();
  }

  async toggleVisibility(id: string): Promise<ITestimonial> {
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      throw new AppError('Testimonial not found', HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    await testimonial.update({ visible: !testimonial.visible });
    return testimonial;
  }
}

export const testimonialService = new TestimonialService();
export default testimonialService;
