import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginRequest, AuthRequest } from '../types';
import { successResponse, errorResponse } from '../utils/helpers';
import { logSecurityEvent } from '../utils/logger';

export class AuthController {
  private authService = new AuthService();
  
  // Connexion admin
  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;
      
      const result = await this.authService.login(credentials);
      
      res.json(successResponse(result, 'Connexion réussie'));
      
    } catch (error) {
      logSecurityEvent('login_attempt_failed', {
        email: req.body.email,
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.status(401).json(errorResponse(error.message, 'LOGIN_FAILED'));
    }
  }
  
  // Rafraîchir le token
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json(errorResponse('Token de rafraîchissement requis', 'REFRESH_TOKEN_REQUIRED'));
        return;
      }
      
      const result = await this.authService.refreshToken(refreshToken);
      
      res.json(successResponse(result, 'Token rafraîchi avec succès'));
      
    } catch (error) {
      res.status(401).json(errorResponse(error.message, 'REFRESH_TOKEN_INVALID'));
    }
  }
  
  // Déconnexion
  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      await this.authService.logout(adminId, refreshToken);
      
      res.json(successResponse(null, 'Déconnexion réussie'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'LOGOUT_FAILED'));
    }
  }
  
  // Changer le mot de passe
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      await this.authService.changePassword(adminId, currentPassword, newPassword);
      
      res.json(successResponse(null, 'Mot de passe modifié avec succès'));
      
    } catch (error) {
      res.status(400).json(errorResponse(error.message, 'PASSWORD_CHANGE_FAILED'));
    }
  }
  
  // Demander une réinitialisation de mot de passe
  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json(errorResponse('Email requis', 'EMAIL_REQUIRED'));
        return;
      }
      
      await this.authService.resetPassword(email);
      
      // Toujours retourner un succès pour ne pas révéler si l'email existe
      res.json(successResponse(null, 'Si cet email existe, un lien de réinitialisation a été envoyé'));
      
    } catch (error) {
      res.status(500).json(errorResponse('Erreur lors de la demande de réinitialisation', 'RESET_REQUEST_FAILED'));
    }
  }
  
  // Confirmer la réinitialisation de mot de passe
  async confirmPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        res.status(400).json(errorResponse('Token et nouveau mot de passe requis', 'TOKEN_AND_PASSWORD_REQUIRED'));
        return;
      }
      
      await this.authService.confirmPasswordReset(token, newPassword);
      
      res.json(successResponse(null, 'Mot de passe réinitialisé avec succès'));
      
    } catch (error) {
      res.status(400).json(errorResponse(error.message, 'PASSWORD_RESET_FAILED'));
    }
  }
  
  // Vérifier le statut d'authentification
  async checkAuth(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      const adminInfo = {
        id: req.admin.id,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
        permissions: req.admin.permissions,
        isActive: req.admin.isActive,
        lastLoginAt: req.admin.lastLoginAt
      };
      
      res.json(successResponse(adminInfo, 'Authentification valide'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'AUTH_CHECK_FAILED'));
    }
  }
  
  // Obtenir les permissions de l'admin connecté
  async getPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      res.json(successResponse({
        permissions: req.admin.permissions,
        role: req.admin.role
      }, 'Permissions récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'PERMISSIONS_FETCH_FAILED'));
    }
  }
  
  // Créer un nouvel admin (réservé aux super admins)
  async createAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.admin || req.admin.role !== 'super_admin') {
        res.status(403).json(errorResponse('Accès refusé', 'ACCESS_DENIED'));
        return;
      }
      
      const adminData = req.body;
      const newAdmin = await this.authService.createAdmin(adminData);
      
      // Ne pas retourner le mot de passe
      const { password, ...adminWithoutPassword } = adminData;
      
      res.status(201).json(successResponse({
        ...newAdmin,
        password: undefined
      }, 'Admin créé avec succès'));
      
    } catch (error) {
      res.status(400).json(errorResponse(error.message, 'ADMIN_CREATION_FAILED'));
    }
  }
  
  // Obtenir la liste des admins (réservé aux super admins)
  async getAdmins(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.admin || req.admin.role !== 'super_admin') {
        res.status(403).json(errorResponse('Accès refusé', 'ACCESS_DENIED'));
        return;
      }
      
      // TODO: Implémenter la récupération de la liste des admins
      res.json(successResponse([], 'Liste des admins récupérée'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'ADMINS_FETCH_FAILED'));
    }
  }
  
  // Désactiver un admin (réservé aux super admins)
  async deactivateAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.admin || req.admin.role !== 'super_admin') {
        res.status(403).json(errorResponse('Accès refusé', 'ACCESS_DENIED'));
        return;
      }
      
      const { adminId } = req.params;
      
      if (adminId === req.admin.id) {
        res.status(400).json(errorResponse('Vous ne pouvez pas vous désactiver vous-même', 'CANNOT_DEACTIVATE_SELF'));
        return;
      }
      
      // TODO: Implémenter la désactivation d'un admin
      res.json(successResponse(null, 'Admin désactivé avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'ADMIN_DEACTIVATION_FAILED'));
    }
  }
}
