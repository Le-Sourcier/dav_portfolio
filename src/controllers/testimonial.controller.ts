import { Request, Response, NextFunction } from 'express';
import { testimonialService } from '../services/testimonial.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export const getAllTestimonials = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonials = await testimonialService.findAll();
    sendSuccess(res, testimonials, 'Testimonials retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getVisibleTestimonials = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonials = await testimonialService.findVisible();
    sendSuccess(res, testimonials, 'Visible testimonials retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTestimonialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hasAuth = !!req.headers.authorization;
    const testimonial = await testimonialService.findById(req.params.id, !hasAuth);
    sendSuccess(res, testimonial, 'Testimonial retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonial = await testimonialService.create(req.body);
    sendCreated(res, testimonial, 'Testimonial created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonial = await testimonialService.update(req.params.id, req.body);
    sendSuccess(res, testimonial, 'Testimonial updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await testimonialService.delete(req.params.id);
    sendSuccess(res, null, 'Testimonial deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const toggleVisibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonial = await testimonialService.toggleVisibility(req.params.id);
    sendSuccess(res, testimonial, 'Testimonial visibility toggled');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllTestimonials,
  getVisibleTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleVisibility,
};
