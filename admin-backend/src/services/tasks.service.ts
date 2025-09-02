import { supabase } from '../config/database.config';
import { 
  Task, 
  TaskFilters, 
  TaskPagination, 
  TaskListResponse,
  TaskStats,
  TaskUpdateRequest,
  TaskStatus,
  TaskPriority,
  TaskAnalytics
} from '../types';
import { calculatePagination, sanitizeObject } from '../utils/helpers';
import { logAdminAction } from '../utils/logger';

export class TaskService {
  // Récupérer toutes les tâches avec filtres et pagination
  async getTasks(filters: TaskFilters, pagination: TaskPagination): Promise<TaskListResponse> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        users!tasks_user_id_fkey(name, email),
        assigned_user:users!tasks_assigned_to_fkey(name, email)
      `, { count: 'exact' });
    
    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    
    if (filters.createdAfter) {
      query = query.gte('created_at', filters.createdAfter.toISOString());
    }
    
    if (filters.createdBefore) {
      query = query.lte('created_at', filters.createdBefore.toISOString());
    }
    
    if (filters.budgetMin !== undefined) {
      query = query.gte('budget', filters.budgetMin);
    }
    
    if (filters.budgetMax !== undefined) {
      query = query.lte('budget', filters.budgetMax);
    }
    
    if (filters.isPaid !== undefined) {
      query = query.eq('is_paid', filters.isPaid);
    }
    
    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Appliquer la pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    
    query = query.range(from, to);
    
    // Trier par date de création (plus récent en premier)
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des tâches: ${error.message}`);
    }
    
    const paginationInfo = calculatePagination(pagination.page, pagination.limit, count || 0);
    
    return {
      tasks: data || [],
      pagination: {
        page: paginationInfo.page,
        limit: paginationInfo.limit,
        total: paginationInfo.total,
        pages: paginationInfo.pages
      }
    };
  }
  
  // Récupérer une tâche par ID
  async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        users!tasks_user_id_fkey(name, email, avatar_url),
        assigned_user:users!tasks_assigned_to_fkey(name, email, avatar_url),
        comments(*),
        help_offers(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Tâche non trouvée
      }
      throw new Error(`Erreur lors de la récupération de la tâche: ${error.message}`);
    }
    
    return data;
  }
  
  // Mettre à jour une tâche
  async updateTask(id: string, updates: TaskUpdateRequest, adminId: string): Promise<Task> {
    // Sanitiser les données
    const sanitizedUpdates = sanitizeObject(updates);
    
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la tâche: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('update_task', adminId, {
      taskId: id,
      updates: sanitizedUpdates
    });
    
    return data;
  }
  
  // Supprimer une tâche
  async deleteTask(id: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: TaskStatus.CANCELLED,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erreur lors de la suppression de la tâche: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('delete_task', adminId, {
      taskId: id
    });
  }
  
  // Assigner une tâche
  async assignTask(taskId: string, assignedTo: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        assigned_to: assignedTo,
        status: TaskStatus.ASSIGNED,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);
    
    if (error) {
      throw new Error(`Erreur lors de l'assignation de la tâche: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('assign_task', adminId, {
      taskId,
      assignedTo
    });
  }
  
  // Marquer une tâche comme terminée
  async completeTask(taskId: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: TaskStatus.COMPLETED,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);
    
    if (error) {
      throw new Error(`Erreur lors de la finalisation de la tâche: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('complete_task', adminId, {
      taskId
    });
  }
  
  // Mettre une tâche en attente
  async holdTask(taskId: string, reason: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        status: TaskStatus.ON_HOLD,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);
    
    if (error) {
      throw new Error(`Erreur lors de la mise en attente de la tâche: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('hold_task', adminId, {
      taskId,
      reason
    });
  }
  
  // Obtenir les statistiques des tâches
  async getTaskStats(): Promise<TaskStats> {
    const [
      totalTasksResult,
      openTasksResult,
      assignedTasksResult,
      completedTasksResult,
      cancelledTasksResult,
      budgetResult
    ] = await Promise.all([
      supabase.from('tasks').select('id', { count: 'exact', head: true }),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', TaskStatus.OPEN),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', TaskStatus.ASSIGNED),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', TaskStatus.COMPLETED),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', TaskStatus.CANCELLED),
      supabase.from('tasks').select('budget').eq('is_paid', true)
    ]);
    
    const totalTasks = totalTasksResult.count || 0;
    const completedTasks = completedTasksResult.count || 0;
    const totalBudget = budgetResult.data?.reduce((sum, task) => sum + (task.budget || 0), 0) || 0;
    const averageBudget = budgetResult.data?.length ? totalBudget / budgetResult.data.length : 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
      totalTasks,
      openTasks: openTasksResult.count || 0,
      assignedTasks: assignedTasksResult.count || 0,
      completedTasks,
      cancelledTasks: cancelledTasksResult.count || 0,
      totalBudget,
      averageBudget,
      completionRate
    };
  }
  
  // Obtenir les analytics des tâches
  async getTaskAnalytics(): Promise<TaskAnalytics> {
    const [
      tasksByStatusResult,
      tasksByCategoryResult,
      tasksByPriorityResult,
      tasksByLocationResult,
      completionTimeResult,
      topPerformersResult
    ] = await Promise.all([
      supabase.from('tasks').select('status'),
      supabase.from('tasks').select('category'),
      supabase.from('tasks').select('priority'),
      supabase.from('tasks').select('location, latitude, longitude').not('location', 'is', null),
      supabase.from('tasks').select('created_at, completed_at').eq('status', TaskStatus.COMPLETED).not('completed_at', 'is', null),
      supabase.from('tasks').select('assigned_to, rating').eq('status', TaskStatus.COMPLETED).not('assigned_to', 'is', null)
    ]);
    
    // Grouper par statut
    const tasksByStatus = tasksByStatusResult.data?.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<TaskStatus, number>) || {};
    
    // Grouper par catégorie
    const tasksByCategory = tasksByCategoryResult.data?.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Grouper par priorité
    const tasksByPriority = tasksByPriorityResult.data?.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<TaskPriority, number>) || {};
    
    // Grouper par localisation
    const locationMap = new Map();
    tasksByLocationResult.data?.forEach(task => {
      const key = task.location;
      if (locationMap.has(key)) {
        locationMap.get(key).count++;
      } else {
        locationMap.set(key, {
          location: key,
          count: 1,
          latitude: task.latitude,
          longitude: task.longitude
        });
      }
    });
    
    const tasksByLocation = Array.from(locationMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
    
    // Calculer le temps moyen de completion
    const completionTimes = completionTimeResult.data?.map(task => {
      const created = new Date(task.created_at);
      const completed = new Date(task.completed_at);
      return completed.getTime() - created.getTime();
    }) || [];
    
    const averageCompletionTime = completionTimes.length > 0 
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
      : 0;
    
    // Top performers
    const performerMap = new Map();
    topPerformersResult.data?.forEach(task => {
      if (task.assigned_to) {
        if (performerMap.has(task.assigned_to)) {
          const performer = performerMap.get(task.assigned_to);
          performer.completed_tasks++;
          performer.total_rating += task.rating || 0;
        } else {
          performerMap.set(task.assigned_to, {
            user_id: task.assigned_to,
            completed_tasks: 1,
            total_rating: task.rating || 0
          });
        }
      }
    });
    
    const topPerformers = Array.from(performerMap.values())
      .map(performer => ({
        user_id: performer.user_id,
        name: '', // À récupérer depuis la table users
        completed_tasks: performer.completed_tasks,
        average_rating: performer.total_rating / performer.completed_tasks
      }))
      .sort((a, b) => b.completed_tasks - a.completed_tasks)
      .slice(0, 10);
    
    return {
      tasksByStatus,
      tasksByCategory,
      tasksByPriority,
      tasksByLocation,
      averageCompletionTime,
      topPerformers
    };
  }
  
  // Rechercher des tâches
  async searchTasks(query: string, limit: number = 20): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        users!tasks_user_id_fkey(name, email)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);
    
    if (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
    
    return data || [];
  }
  
  // Obtenir les tâches récentes
  async getRecentTasks(limit: number = 20): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        users!tasks_user_id_fkey(name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des tâches récentes: ${error.message}`);
    }
    
    return data || [];
  }
  
  // Obtenir les tâches par localisation
  async getTasksByLocation(location: string, limit: number = 50): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        users!tasks_user_id_fkey(name, email)
      `)
      .ilike('location', `%${location}%`)
      .limit(limit);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération par localisation: ${error.message}`);
    }
    
    return data || [];
  }
  
  // Obtenir les tâches urgentes
  async getUrgentTasks(limit: number = 20): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        users!tasks_user_id_fkey(name, email)
      `)
      .eq('priority', TaskPriority.URGENT)
      .in('status', [TaskStatus.OPEN, TaskStatus.ASSIGNED])
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des tâches urgentes: ${error.message}`);
    }
    
    return data || [];
  }
  
  // Logger une action admin
  private async logAdminAction(action: string, adminId: string, details: any): Promise<void> {
    try {
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: adminId,
          action,
          details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Erreur lors du log admin:', error);
    }
  }
}
