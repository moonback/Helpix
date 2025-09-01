import { Router } from 'express';
import { TasksController } from '../controllers/tasks.controller';
import { 
  authenticateAdmin, 
  requirePermission 
} from '../middleware/auth.middleware';
import { 
  validateTaskFilters,
  validatePagination,
  validateTaskUpdate,
  validateUUID 
} from '../middleware/validation.middleware';
import { 
  generalRateLimit,
  exportRateLimit,
  searchRateLimit 
} from '../middleware/rateLimit.middleware';
import { Permission } from '../types';

const router = Router();
const tasksController = new TasksController();

// Toutes les routes nécessitent une authentification admin
router.use(authenticateAdmin);

// Routes de lecture (permission VIEW_TASKS)
router.get('/',
  requirePermission(Permission.VIEW_TASKS),
  generalRateLimit,
  validateTaskFilters,
  validatePagination,
  tasksController.getTasks.bind(tasksController)
);

router.get('/stats',
  requirePermission(Permission.VIEW_TASKS),
  generalRateLimit,
  tasksController.getTaskStats.bind(tasksController)
);

router.get('/analytics',
  requirePermission(Permission.VIEW_ANALYTICS),
  generalRateLimit,
  tasksController.getTaskAnalytics.bind(tasksController)
);

router.get('/recent',
  requirePermission(Permission.VIEW_TASKS),
  generalRateLimit,
  tasksController.getRecentTasks.bind(tasksController)
);

router.get('/urgent',
  requirePermission(Permission.VIEW_TASKS),
  generalRateLimit,
  tasksController.getUrgentTasks.bind(tasksController)
);

router.get('/categories',
  requirePermission(Permission.VIEW_TASKS),
  generalRateLimit,
  tasksController.getTaskCategories.bind(tasksController)
);

router.get('/search',
  requirePermission(Permission.VIEW_TASKS),
  searchRateLimit,
  tasksController.searchTasks.bind(tasksController)
);

router.get('/location/:location',
  requirePermission(Permission.VIEW_TASKS),
  generalRateLimit,
  tasksController.getTasksByLocation.bind(tasksController)
);

router.get('/export',
  requirePermission(Permission.EXPORT_DATA),
  exportRateLimit,
  tasksController.exportTasks.bind(tasksController)
);

// Routes avec paramètre ID
router.get('/:id',
  requirePermission(Permission.VIEW_TASKS),
  validateUUID('id'),
  generalRateLimit,
  tasksController.getTaskById.bind(tasksController)
);

// Routes de modification (permission EDIT_TASKS)
router.patch('/:id',
  requirePermission(Permission.EDIT_TASKS),
  validateUUID('id'),
  validateTaskUpdate,
  generalRateLimit,
  tasksController.updateTask.bind(tasksController)
);

router.post('/:id/assign',
  requirePermission(Permission.EDIT_TASKS),
  validateUUID('id'),
  generalRateLimit,
  tasksController.assignTask.bind(tasksController)
);

router.post('/:id/complete',
  requirePermission(Permission.EDIT_TASKS),
  validateUUID('id'),
  generalRateLimit,
  tasksController.completeTask.bind(tasksController)
);

router.post('/:id/hold',
  requirePermission(Permission.EDIT_TASKS),
  validateUUID('id'),
  generalRateLimit,
  tasksController.holdTask.bind(tasksController)
);

router.post('/:id/moderate',
  requirePermission(Permission.MODERATE_TASKS),
  validateUUID('id'),
  generalRateLimit,
  tasksController.moderateTask.bind(tasksController)
);

// Routes de suppression (permission DELETE_TASKS)
router.delete('/:id',
  requirePermission(Permission.DELETE_TASKS),
  validateUUID('id'),
  generalRateLimit,
  tasksController.deleteTask.bind(tasksController)
);

export default router;
