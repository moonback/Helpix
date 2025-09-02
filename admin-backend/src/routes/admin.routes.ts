import { Router } from 'express';
import { 
  authenticateAdmin, 
  requireRole 
} from '../middleware/auth.middleware';
import { generalRateLimit } from '../middleware/rateLimit.middleware';
import { AdminRole } from '../types';

const router = Router();

// Toutes les routes nécessitent une authentification admin
router.use(authenticateAdmin);

// Route de santé pour les admins
router.get('/health',
  generalRateLimit,
  (req, res) => {
    res.json({
      success: true,
      message: 'Admin API is healthy',
      timestamp: new Date().toISOString(),
      admin: {
        id: req.admin?.id,
        email: req.admin?.email,
        role: req.admin?.role
      }
    });
  }
);

// Route pour obtenir les informations de l'admin connecté
router.get('/profile',
  generalRateLimit,
  (req, res) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: req.admin.id,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
        permissions: req.admin.permissions,
        isActive: req.admin.isActive,
        lastLoginAt: req.admin.lastLoginAt,
        createdAt: req.admin.createdAt,
        updatedAt: req.admin.updatedAt
      }
    });
  }
);

// Route pour mettre à jour le profil admin
router.patch('/profile',
  generalRateLimit,
  (req, res) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
    }
    
    // TODO: Implémenter la mise à jour du profil
    res.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  }
);

// Routes réservées aux super admins
router.get('/system-info',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    res.json({
      success: true,
      data: {
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV
      }
    });
  }
);

router.get('/logs',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la récupération des logs
    res.json({
      success: true,
      data: [],
      message: 'Logs récupérés avec succès'
    });
  }
);

router.get('/settings',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la récupération des paramètres système
    res.json({
      success: true,
      data: {
        maintenance: false,
        registrationEnabled: true,
        emailNotifications: true,
        maxFileSize: '10MB',
        supportedFormats: ['jpg', 'png', 'pdf']
      }
    });
  }
);

router.patch('/settings',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la mise à jour des paramètres système
    res.json({
      success: true,
      message: 'Paramètres mis à jour avec succès'
    });
  }
);

// Routes pour la gestion des notifications
router.get('/notifications',
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la récupération des notifications admin
    res.json({
      success: true,
      data: [],
      message: 'Notifications récupérées'
    });
  }
);

router.post('/notifications/broadcast',
  requireRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter l'envoi de notifications broadcast
    res.json({
      success: true,
      message: 'Notification broadcast envoyée'
    });
  }
);

// Routes pour la gestion des sauvegardes
router.get('/backups',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la liste des sauvegardes
    res.json({
      success: true,
      data: [],
      message: 'Sauvegardes récupérées'
    });
  }
);

router.post('/backups/create',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la création de sauvegarde
    res.json({
      success: true,
      message: 'Sauvegarde créée avec succès'
    });
  }
);

// Routes pour la gestion des sessions
router.get('/sessions',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la récupération des sessions actives
    res.json({
      success: true,
      data: [],
      message: 'Sessions récupérées'
    });
  }
);

router.delete('/sessions/:sessionId',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la déconnexion d'une session
    res.json({
      success: true,
      message: 'Session déconnectée'
    });
  }
);

// Routes pour la gestion des erreurs
router.get('/errors',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la récupération des erreurs système
    res.json({
      success: true,
      data: [],
      message: 'Erreurs récupérées'
    });
  }
);

router.delete('/errors/:errorId',
  requireRole([AdminRole.SUPER_ADMIN]),
  generalRateLimit,
  (req, res) => {
    // TODO: Implémenter la suppression d'une erreur
    res.json({
      success: true,
      message: 'Erreur supprimée'
    });
  }
);

export default router;
