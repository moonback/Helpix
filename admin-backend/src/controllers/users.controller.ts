import { Request, Response } from 'express';
import { UserService } from '../services/users.service';
import { AuthRequest, UserFilters, UserPagination } from '../types';
import { successResponse, errorResponse, validatePagination, validateUserFilters } from '../utils/helpers';
import { logAdminAction } from '../utils/logger';

export class UsersController {
  private userService = new UserService();
  
  // Récupérer tous les utilisateurs avec filtres
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const validatedFilters = validateUserFilters(filters);
      const pagination = validatePagination({ page, limit });
      
      const result = await this.userService.getUsers(validatedFilters, pagination);
      
      res.json(successResponse(result.users, 'Utilisateurs récupérés avec succès', {
        pagination: result.pagination
      }));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USERS_FETCH_FAILED'));
    }
  }
  
  // Récupérer un utilisateur spécifique
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        res.status(404).json(errorResponse('Utilisateur non trouvé', 'USER_NOT_FOUND'));
        return;
      }
      
      res.json(successResponse(user, 'Utilisateur récupéré avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_FETCH_FAILED'));
    }
  }
  
  // Mettre à jour un utilisateur
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      const user = await this.userService.updateUser(id, updates);
      
      res.json(successResponse(user, 'Utilisateur mis à jour avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_UPDATE_FAILED'));
    }
  }
  
  // Suspendre un utilisateur
  async suspendUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason, duration } = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      if (!reason) {
        res.status(400).json(errorResponse('Raison de suspension requise', 'REASON_REQUIRED'));
        return;
      }
      
      await this.userService.suspendUser(id, { reason, duration }, adminId);
      
      res.json(successResponse(null, 'Utilisateur suspendu avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_SUSPENSION_FAILED'));
    }
  }
  
  // Bannir un utilisateur
  async banUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      if (!reason) {
        res.status(400).json(errorResponse('Raison de bannissement requise', 'REASON_REQUIRED'));
        return;
      }
      
      await this.userService.banUser(id, reason, adminId);
      
      res.json(successResponse(null, 'Utilisateur banni avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_BAN_FAILED'));
    }
  }
  
  // Réactiver un utilisateur
  async reactivateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      await this.userService.reactivateUser(id, adminId);
      
      res.json(successResponse(null, 'Utilisateur réactivé avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_REACTIVATION_FAILED'));
    }
  }
  
  // Supprimer un utilisateur
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      await this.userService.deleteUser(id, adminId);
      
      res.json(successResponse(null, 'Utilisateur supprimé avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_DELETION_FAILED'));
    }
  }
  
  // Obtenir les statistiques des utilisateurs
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.userService.getUserStats();
      
      res.json(successResponse(stats, 'Statistiques des utilisateurs récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_STATS_FAILED'));
    }
  }
  
  // Exporter les données utilisateur
  async exportUsers(req: Request, res: Response): Promise<void> {
    try {
      const { format = 'csv', ...filters } = req.query;
      const validatedFilters = validateUserFilters(filters);
      
      const data = await this.userService.exportUsers(validatedFilters, format as 'csv' | 'json');
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=users.json');
      } else {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      }
      
      res.send(data);
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_EXPORT_FAILED'));
    }
  }
  
  // Obtenir le wallet d'un utilisateur
  async getUserWallet(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const wallet = await this.userService.getUserWallet(id);
      
      if (!wallet) {
        res.status(404).json(errorResponse('Wallet non trouvé', 'WALLET_NOT_FOUND'));
        return;
      }
      
      res.json(successResponse(wallet, 'Wallet récupéré avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'WALLET_FETCH_FAILED'));
    }
  }
  
  // Obtenir l'activité d'un utilisateur
  async getUserActivity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;
      
      const activity = await this.userService.getUserActivity(id, parseInt(limit as string, 10));
      
      res.json(successResponse(activity, 'Activité utilisateur récupérée'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_ACTIVITY_FAILED'));
    }
  }
  
  // Rechercher des utilisateurs
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json(errorResponse('Terme de recherche requis', 'SEARCH_QUERY_REQUIRED'));
        return;
      }
      
      const users = await this.userService.searchUsers(q, parseInt(limit as string, 10));
      
      res.json(successResponse(users, 'Recherche d\'utilisateurs terminée'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USER_SEARCH_FAILED'));
    }
  }
  
  // Obtenir les utilisateurs par localisation
  async getUsersByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { location, limit = 50 } = req.query;
      
      if (!location || typeof location !== 'string') {
        res.status(400).json(errorResponse('Localisation requise', 'LOCATION_REQUIRED'));
        return;
      }
      
      const users = await this.userService.getUsersByLocation(location, parseInt(limit as string, 10));
      
      res.json(successResponse(users, 'Utilisateurs par localisation récupérés'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'USERS_BY_LOCATION_FAILED'));
    }
  }
  
  // Obtenir les utilisateurs récents
  async getRecentUsers(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 20 } = req.query;
      
      const users = await this.userService.getRecentUsers(parseInt(limit as string, 10));
      
      res.json(successResponse(users, 'Utilisateurs récents récupérés'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'RECENT_USERS_FAILED'));
    }
  }
  
  // Gérer les crédits d'un utilisateur
  async manageUserCredits(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, amount, reason } = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      if (!action || !amount || !reason) {
        res.status(400).json(errorResponse('Action, montant et raison requis', 'MISSING_PARAMETERS'));
        return;
      }
      
      if (!['add', 'remove'].includes(action)) {
        res.status(400).json(errorResponse('Action doit être "add" ou "remove"', 'INVALID_ACTION'));
        return;
      }
      
      if (amount <= 0) {
        res.status(400).json(errorResponse('Le montant doit être positif', 'INVALID_AMOUNT'));
        return;
      }
      
      // TODO: Implémenter la gestion des crédits
      res.json(successResponse(null, 'Crédits gérés avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'CREDIT_MANAGEMENT_FAILED'));
    }
  }
}
