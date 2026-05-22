import { sequelize } from '../config/database.js';
import Admin from './Admin.js';
import Project from './Project.js';
import Experience from './Experience.js';
import BlogPost, { Comment, BlogView, BlogTag, BlogPostTag } from './BlogPost.js';
import Contact from './Contact.js';
import Appointment from './Appointment.js';
import Newsletter from './Newsletter.js';
import Testimonial from './Testimonial.js';
import Settings from './Settings.js';
import VisitorOtp from './VisitorOtp.js';
import AnalyticsPageView from './AnalyticsPageView.js';

// Export all models
export {
  sequelize,
  Admin,
  Project,
  Experience,
  BlogPost,
  Comment,
  BlogView,
  BlogTag,
  BlogPostTag,
  Contact,
  Appointment,
  Newsletter,
  Testimonial,
  Settings,
  VisitorOtp,
  AnalyticsPageView,
};

// Export db object for convenience
const db = {
  sequelize,
  Admin,
  Project,
  Experience,
  BlogPost,
  BlogTag,
  Comment,
  Contact,
  Appointment,
  Newsletter,
  Testimonial,
  Settings,
  AnalyticsPageView,
};

export default db;
