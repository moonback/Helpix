import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { 
  authenticateAdmin, 
  requirePermission 
} from '../middleware/auth.middleware';
import { 
  validateUserFilters,
  validatePagination,
  validateUserUpdate,
  validateUserSuspension,
  validateUUID 
} from '../middleware/validation.middleware';
import { 
  generalRateLimit,
  exportRateLimit,
  searchRateLimit 
} from '../middleware/rateLimit.middleware';
import { Permission } from '../types';

const router = Router();
const usersController = new UsersController();

// Toutes les routes nécessitent une authentification admin
router.use(authenticateAdmin);

// Routes de lecture (permission VIEW_USERS)
router.get('/',
  requirePermission(Permission.VIEW_USERS),
  generalRateLimit,
  validateUserFilters,
  validatePagination,
  usersController.getUsers.bind(usersController)
);

router.get('/stats',
  requirePermission(Permission.VIEW_USERS),
  generalRateLimit,
  usersController.getUserStats.bind(usersController)
);

router.get('/recent',
  requirePermission(Permission.VIEW_USERS),
  generalRateLimit,
  usersController.getRecentUsers.bind(usersController)
);

router.get('/search',
  requirePermission(Permission.VIEW_USERS),
  searchRateLimit,
  usersController.searchUsers.bind(usersController)
);

router.get('/location/:location',
  requirePermission(Permission.VIEW_USERS),
  generalRateLimit,
  usersController.getUsersByLocation.bind(usersController)
);

router.get('/export',
  requirePermission(Permission.EXPORT_DATA),
  exportRateLimit,
  usersController.exportUsers.bind(usersController)
);

// Routes avec paramètre ID
router.get('/:id',
  requirePermission(Permission.VIEW_USERS),
  validateUUID('id'),
  generalRateLimit,
  usersController.getUserById.bind(usersController)
);

router.get('/:id/wallet',
  requirePermission(Permission.VIEW_USERS),
  validateUUID('id'),
  generalRateLimit,
  usersController.getUserWallet.bind(usersController)
);

router.get('/:id/activity',
  requirePermission(Permission.VIEW_USERS),
  validateUUID('id'),
  generalRateLimit,
  usersController.getUserActivity.bind(usersController)
);

// Routes de modification (permission EDIT_USERS)
router.patch('/:id',
  requirePermission(Permission.EDIT_USERS),
  validateUUID('id'),
  validateUserUpdate,
  generalRateLimit,
  usersController.updateUser.bind(usersController)
);

router.post('/:id/suspend',
  requirePermission(Permission.BAN_USERS),
  validateUUID('id'),
  validateUserSuspension,
  generalRateLimit,
  usersController.suspendUser.bind(usersController)
);

router.post('/:id/ban',
  requirePermission(Permission.BAN_USERS),
  validateUUID('id'),
  generalRateLimit,
  usersController.banUser.bind(usersController)
);

router.post('/:id/reactivate',
  requirePermission(Permission.EDIT_USERS),
  validateUUID('id'),
  generalRateLimit,
  usersController.reactivateUser.bind(usersController)
);

router.post('/:id/credits',
  requirePermission(Permission.MANAGE_CREDITS),
  validateUUID('id'),
  generalRateLimit,
  usersController.manageUserCredits.bind(usersController)
);

// Routes de suppression (permission DELETE_USERS)
router.delete('/:id',
  requirePermission(Permission.DELETE_USERS),
  validateUUID('id'),
  generalRateLimit,
  usersController.deleteUser.bind(usersController)
);

export default router;
