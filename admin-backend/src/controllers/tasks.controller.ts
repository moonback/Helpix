import { Request, Response } from 'express';
import { TaskService } from '../services/tasks.service';
import { AuthRequest, TaskFilters, TaskPagination } from '../types';
import { successResponse, errorResponse, validatePagination, validateTaskFilters } from '../utils/helpers';

export class TasksController {
  private taskService = new TaskService();
  
  // Récupérer toutes les tâches avec filtres
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, ...filters } = req.query;
      const validatedFilters = validateTaskFilters(filters);
      const pagination = validatePagination({ page, limit });
      
      const result = await this.taskService.getTasks(validatedFilters, pagination);
      
      res.json(successResponse(result.tasks, 'Tâches récupérées avec succès', {
        pagination: result.pagination
      }));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASKS_FETCH_FAILED'));
    }
  }
  
  // Récupérer une tâche spécifique
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        res.status(404).json(errorResponse('Tâche non trouvée', 'TASK_NOT_FOUND'));
        return;
      }
      
      res.json(successResponse(task, 'Tâche récupérée avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_FETCH_FAILED'));
    }
  }
  
  // Mettre à jour une tâche
  async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      const task = await this.taskService.updateTask(id, updates, adminId);
      
      res.json(successResponse(task, 'Tâche mise à jour avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_UPDATE_FAILED'));
    }
  }
  
  // Supprimer une tâche
  async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      await this.taskService.deleteTask(id, adminId);
      
      res.json(successResponse(null, 'Tâche supprimée avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_DELETION_FAILED'));
    }
  }
  
  // Assigner une tâche
  async assignTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      if (!assignedTo) {
        res.status(400).json(errorResponse('Utilisateur assigné requis', 'ASSIGNED_TO_REQUIRED'));
        return;
      }
      
      await this.taskService.assignTask(id, assignedTo, adminId);
      
      res.json(successResponse(null, 'Tâche assignée avec succès'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_ASSIGNMENT_FAILED'));
    }
  }
  
  // Marquer une tâche comme terminée
  async completeTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      await this.taskService.completeTask(id, adminId);
      
      res.json(successResponse(null, 'Tâche marquée comme terminée'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_COMPLETION_FAILED'));
    }
  }
  
  // Mettre une tâche en attente
  async holdTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      if (!reason) {
        res.status(400).json(errorResponse('Raison de mise en attente requise', 'REASON_REQUIRED'));
        return;
      }
      
      await this.taskService.holdTask(id, reason, adminId);
      
      res.json(successResponse(null, 'Tâche mise en attente'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_HOLD_FAILED'));
    }
  }
  
  // Obtenir les statistiques des tâches
  async getTaskStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.taskService.getTaskStats();
      
      res.json(successResponse(stats, 'Statistiques des tâches récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_STATS_FAILED'));
    }
  }
  
  // Obtenir les analytics des tâches
  async getTaskAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const analytics = await this.taskService.getTaskAnalytics();
      
      res.json(successResponse(analytics, 'Analytics des tâches récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_ANALYTICS_FAILED'));
    }
  }
  
  // Rechercher des tâches
  async searchTasks(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = 20 } = req.query;
      
      if (!q || typeof q !== 'string') {
        res.status(400).json(errorResponse('Terme de recherche requis', 'SEARCH_QUERY_REQUIRED'));
        return;
      }
      
      const tasks = await this.taskService.searchTasks(q, parseInt(limit as string, 10));
      
      res.json(successResponse(tasks, 'Recherche de tâches terminée'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_SEARCH_FAILED'));
    }
  }
  
  // Obtenir les tâches récentes
  async getRecentTasks(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 20 } = req.query;
      
      const tasks = await this.taskService.getRecentTasks(parseInt(limit as string, 10));
      
      res.json(successResponse(tasks, 'Tâches récentes récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'RECENT_TASKS_FAILED'));
    }
  }
  
  // Obtenir les tâches par localisation
  async getTasksByLocation(req: Request, res: Response): Promise<void> {
    try {
      const { location, limit = 50 } = req.query;
      
      if (!location || typeof location !== 'string') {
        res.status(400).json(errorResponse('Localisation requise', 'LOCATION_REQUIRED'));
        return;
      }
      
      const tasks = await this.taskService.getTasksByLocation(location, parseInt(limit as string, 10));
      
      res.json(successResponse(tasks, 'Tâches par localisation récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASKS_BY_LOCATION_FAILED'));
    }
  }
  
  // Obtenir les tâches urgentes
  async getUrgentTasks(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 20 } = req.query;
      
      const tasks = await this.taskService.getUrgentTasks(parseInt(limit as string, 10));
      
      res.json(successResponse(tasks, 'Tâches urgentes récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'URGENT_TASKS_FAILED'));
    }
  }
  
  // Exporter les tâches
  async exportTasks(req: Request, res: Response): Promise<void> {
    try {
      const { format = 'csv', ...filters } = req.query;
      const validatedFilters = validateTaskFilters(filters);
      
      // Récupérer toutes les tâches (sans pagination)
      const result = await this.taskService.getTasks(validatedFilters, { page: 1, limit: 10000 });
      
      let data: string;
      
      if (format === 'json') {
        data = JSON.stringify(result.tasks, null, 2);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=tasks.json');
      } else {
        // Format CSV
        const headers = ['ID', 'Titre', 'Description', 'Catégorie', 'Localisation', 'Statut', 'Priorité', 'Budget', 'Créé le'];
        const rows = result.tasks.map(task => [
          task.id,
          task.title,
          task.description,
          task.category,
          task.location,
          task.status,
          task.priority,
          task.budget,
          new Date(task.created_at).toLocaleDateString('fr-FR')
        ]);
        
        data = [headers, ...rows].map(row => row.join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
      }
      
      res.send(data);
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_EXPORT_FAILED'));
    }
  }
  
  // Obtenir les catégories de tâches
  async getTaskCategories(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Implémenter la récupération des catégories depuis la base de données
      const categories = [
        { id: '1', name: 'Ménage', description: 'Tâches de nettoyage et d\'entretien', icon: '🧹', color: '#3B82F6' },
        { id: '2', name: 'Jardinage', description: 'Tâches de jardin et d\'extérieur', icon: '🌱', color: '#10B981' },
        { id: '3', name: 'Bricolage', description: 'Tâches de réparation et construction', icon: '🔨', color: '#F59E0B' },
        { id: '4', name: 'Transport', description: 'Services de transport et livraison', icon: '🚗', color: '#8B5CF6' },
        { id: '5', name: 'Autre', description: 'Autres types de tâches', icon: '📋', color: '#6B7280' }
      ];
      
      res.json(successResponse(categories, 'Catégories de tâches récupérées'));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_CATEGORIES_FAILED'));
    }
  }
  
  // Modérer une tâche (changer le statut de modération)
  async moderateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { action, reason } = req.body; // action: 'approve', 'reject', 'flag'
      const adminId = req.admin?.id;
      
      if (!adminId) {
        res.status(401).json(errorResponse('Non authentifié', 'NOT_AUTHENTICATED'));
        return;
      }
      
      if (!action || !['approve', 'reject', 'flag'].includes(action)) {
        res.status(400).json(errorResponse('Action de modération invalide', 'INVALID_MODERATION_ACTION'));
        return;
      }
      
      // TODO: Implémenter la logique de modération
      res.json(successResponse(null, `Tâche ${action === 'approve' ? 'approuvée' : action === 'reject' ? 'rejetée' : 'signalée'}`));
      
    } catch (error) {
      res.status(500).json(errorResponse(error.message, 'TASK_MODERATION_FAILED'));
    }
  }
}
