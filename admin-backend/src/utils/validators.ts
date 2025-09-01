import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AdminRole, Permission, UserStatus, TaskStatus, TaskPriority } from '../types';

// Validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const userFiltersSchema = Joi.object({
  status: Joi.string().valid(...Object.values(UserStatus)).optional(),
  location: Joi.string().max(255).optional(),
  createdAfter: Joi.date().optional(),
  createdBefore: Joi.date().optional(),
  emailVerified: Joi.boolean().optional(),
  phoneVerified: Joi.boolean().optional(),
  search: Joi.string().max(255).optional()
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const taskFiltersSchema = Joi.object({
  status: Joi.string().valid(...Object.values(TaskStatus)).optional(),
  category: Joi.string().max(100).optional(),
  priority: Joi.string().valid(...Object.values(TaskPriority)).optional(),
  location: Joi.string().max(255).optional(),
  createdAfter: Joi.date().optional(),
  createdBefore: Joi.date().optional(),
  budgetMin: Joi.number().min(0).optional(),
  budgetMax: Joi.number().min(0).optional(),
  isPaid: Joi.boolean().optional(),
  assignedTo: Joi.string().uuid().optional(),
  search: Joi.string().max(255).optional()
});

export const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  location: Joi.string().max(255).optional(),
  phone: Joi.string().max(20).optional(),
  bio: Joi.string().max(500).optional(),
  status: Joi.string().valid(...Object.values(UserStatus)).optional()
});

export const userSuspensionSchema = Joi.object({
  reason: Joi.string().min(10).max(500).required(),
  duration: Joi.number().integer().min(0).optional() // en millisecondes
});

export const taskUpdateSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  description: Joi.string().min(10).max(2000).optional(),
  category: Joi.string().max(100).optional(),
  location: Joi.string().max(255).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  status: Joi.string().valid(...Object.values(TaskStatus)).optional(),
  priority: Joi.string().valid(...Object.values(TaskPriority)).optional(),
  budget: Joi.number().min(0).optional(),
  deadline: Joi.date().optional(),
  assigned_to: Joi.string().uuid().optional(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).optional(),
  is_paid: Joi.boolean().optional()
});

export const adminUserSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid(...Object.values(AdminRole)).required(),
  permissions: Joi.array().items(Joi.string().valid(...Object.values(Permission))).required(),
  isActive: Joi.boolean().default(true)
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(8).max(128).required()
});

export const notificationSchema = Joi.object({
  type: Joi.string().max(50).required(),
  title: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).max(1000).required(),
  data: Joi.object().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  sendEmail: Joi.boolean().default(false),
  sendPush: Joi.boolean().default(false),
  targetUsers: Joi.array().items(Joi.string().uuid()).optional()
});

export const dateRangeSchema = Joi.object({
  start: Joi.date().required(),
  end: Joi.date().min(Joi.ref('start')).required()
});

export const exportRequestSchema = Joi.object({
  type: Joi.string().valid('users', 'tasks', 'transactions', 'analytics').required(),
  format: Joi.string().valid('csv', 'json', 'xlsx').required(),
  filters: Joi.object().optional(),
  fields: Joi.array().items(Joi.string()).optional()
});

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    req[property] = value;
    next();
  };
};

// Validation helpers
export const validatePagination = (pagination: any) => {
  const { error, value } = paginationSchema.validate(pagination);
  if (error) throw new Error('Invalid pagination parameters');
  return value;
};

export const validateUserFilters = (filters: any) => {
  const { error, value } = userFiltersSchema.validate(filters);
  if (error) throw new Error('Invalid user filters');
  return value;
};

export const validateTaskFilters = (filters: any) => {
  const { error, value } = taskFiltersSchema.validate(filters);
  if (error) throw new Error('Invalid task filters');
  return value;
};

export const validateDateRange = (dateRange: any) => {
  const { error, value } = dateRangeSchema.validate(dateRange);
  if (error) throw new Error('Invalid date range');
  return value;
};

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

// Input validation helpers
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidPassword = (password: string): boolean => {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
