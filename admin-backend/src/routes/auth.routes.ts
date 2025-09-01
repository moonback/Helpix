import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { 
  authenticateAdmin, 
  requirePermission, 
  requireRole 
} from '../middleware/auth.middleware';
import { 
  validateLogin, 
  validateChangePassword,
  validateUUID 
} from '../middleware/validation.middleware';
import { 
  authRateLimit, 
  generalRateLimit 
} from '../middleware/rateLimit.middleware';
import { Permission, AdminRole } from '../types';

const router = Router();
const authController = new AuthController();

// Routes publiques (sans authentification)
router.post('/login', 
  authRateLimit,
  validateLogin,
  authController.login.bind(authController)
);

router.post('/refresh-token',
  generalRateLimit,
  authController.refreshToken.bind(authController)
);

router.post('/request-password-reset',
  generalRateLimit,
  authController.requestPasswordReset.bind(authController)
);

router.post('/confirm-password-reset',
  generalRateLimit,
  authController.confirmPasswordReset.bind(authController)
);

// Routes protégées (authentification requise)
router.use(authenticateAdmin);

router.post('/logout',
  generalRateLimit,
  authController.logout.bind(authController)
);

router.get('/check',
  generalRateLimit,
  authController.checkAuth.bind(authController)
);

router.get('/permissions',
  generalRateLimit,
  authController.getPermissions.bind(authController)
);

router.post('/change-password',
  generalRateLimit,
  validateChangePassword,
  authController.changePassword.bind(authController)
);

// Routes réservées aux super admins
router.post('/create-admin',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  authController.createAdmin.bind(authController)
);

router.get('/admins',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  authController.getAdmins.bind(authController)
);

router.patch('/admins/:adminId/deactivate',
  requireRole([AdminRole.SUPER_ADMIN]),
  validateUUID('adminId'),
  generalRateLimit,
  authController.deactivateAdmin.bind(authController)
);

export default router;
