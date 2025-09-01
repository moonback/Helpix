import { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../utils/validators';
import { 
  loginSchema, 
  userFiltersSchema, 
  paginationSchema, 
  taskFiltersSchema,
  userUpdateSchema,
  userSuspensionSchema,
  taskUpdateSchema,
  adminUserSchema,
  changePasswordSchema,
  notificationSchema,
  dateRangeSchema,
  exportRequestSchema
} from '../utils/validators';

// Auth validation middlewares
export const validateLogin = validateRequest(loginSchema, 'body');
export const validateChangePassword = validateRequest(changePasswordSchema, 'body');

// User validation middlewares
export const validateUserFilters = validateRequest(userFiltersSchema, 'query');
export const validatePagination = validateRequest(paginationSchema, 'query');
export const validateUserUpdate = validateRequest(userUpdateSchema, 'body');
export const validateUserSuspension = validateRequest(userSuspensionSchema, 'body');

// Task validation middlewares
export const validateTaskFilters = validateRequest(taskFiltersSchema, 'query');
export const validateTaskUpdate = validateRequest(taskUpdateSchema, 'body');

// Admin validation middlewares
export const validateAdminUser = validateRequest(adminUserSchema, 'body');

// Notification validation middlewares
export const validateNotification = validateRequest(notificationSchema, 'body');

// Analytics validation middlewares
export const validateDateRange = validateRequest(dateRangeSchema, 'body');
export const validateExportRequest = validateRequest(exportRequestSchema, 'body');

// Custom validation middleware for UUID parameters
export const validateUUID = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.params[paramName];
    
    if (!uuid) {
      res.status(400).json({
        success: false,
        error: `Paramètre ${paramName} requis`
      });
      return;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      res.status(400).json({
        success: false,
        error: `Format UUID invalide pour ${paramName}`
      });
      return;
    }
    
    next();
  };
};

// Validation middleware for file uploads
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
} = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], required = false } = options;
    
    if (required && (!req.file && !req.files)) {
      res.status(400).json({
        success: false,
        error: 'Fichier requis'
      });
      return;
    }
    
    if (req.file) {
      // Single file validation
      if (maxSize && req.file.size > maxSize) {
        res.status(400).json({
          success: false,
          error: `Fichier trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`
        });
        return;
      }
      
      if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
        res.status(400).json({
          success: false,
          error: `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`
        });
        return;
      }
    }
    
    if (req.files && Array.isArray(req.files)) {
      // Multiple files validation
      for (const file of req.files) {
        if (maxSize && file.size > maxSize) {
          res.status(400).json({
            success: false,
            error: `Fichier ${file.originalname} trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`
          });
          return;
        }
        
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
          res.status(400).json({
            success: false,
            error: `Type de fichier non autorisé pour ${file.originalname}. Types autorisés: ${allowedTypes.join(', ')}`
          });
          return;
        }
      }
    }
    
    next();
  };
};

// Validation middleware for query parameters
export const validateQueryParams = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        error: 'Paramètres de requête invalides',
        details: errors
      });
      return;
    }

    req.query = value;
    next();
  };
};

// Validation middleware for request body
export const validateBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        error: 'Données de requête invalides',
        details: errors
      });
      return;
    }

    req.body = value;
    next();
  };
};

// Validation middleware for request parameters
export const validateParams = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      res.status(400).json({
        success: false,
        error: 'Paramètres d\'URL invalides',
        details: errors
      });
      return;
    }

    req.params = value;
    next();
  };
};

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    
    return obj;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }
  
  next();
};
