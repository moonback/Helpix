import { supabase } from '../config/database.config';
import { 
  User, 
  UserFilters, 
  UserPagination, 
  UserListResponse,
  UserStats,
  UserSuspensionRequest,
  UserUpdateRequest,
  UserStatus,
  UserWallet
} from '../types';
import { calculatePagination, sanitizeObject } from '../utils/helpers';
import { logAdminAction } from '../utils/logger';

export class UserService {
  // Récupérer tous les utilisateurs avec filtres et pagination
  async getUsers(filters: UserFilters, pagination: UserPagination): Promise<UserListResponse> {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
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
    
    if (filters.emailVerified !== undefined) {
      query = query.eq('email_verified', filters.emailVerified);
    }
    
    if (filters.phoneVerified !== undefined) {
      query = query.eq('phone_verified', filters.phoneVerified);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
    
    // Appliquer la pagination
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;
    
    query = query.range(from, to);
    
    // Trier par date de création (plus récent en premier)
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }
    
    const paginationInfo = calculatePagination(pagination.page, pagination.limit, count || 0);
    
    return {
      users: data || [],
      pagination: {
        page: paginationInfo.page,
        limit: paginationInfo.limit,
        total: paginationInfo.total,
        pages: paginationInfo.pages
      }
    };
  }
  
  // Récupérer un utilisateur par ID
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        wallets(*),
        tasks(count),
        help_offers(count)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Utilisateur non trouvé
      }
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }
    
    return data;
  }
  
  // Mettre à jour un utilisateur
  async updateUser(id: string, updates: UserUpdateRequest): Promise<User> {
    // Sanitiser les données
    const sanitizedUpdates = sanitizeObject(updates);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
    
    return data;
  }
  
  // Suspendre un utilisateur
  async suspendUser(id: string, suspensionData: UserSuspensionRequest, adminId: string): Promise<void> {
    const suspensionInfo = {
      status: UserStatus.SUSPENDED,
      suspension_reason: suspensionData.reason,
      suspended_until: suspensionData.duration ? new Date(Date.now() + suspensionData.duration) : null,
      suspended_at: new Date(),
      updated_at: new Date()
    };
    
    const { error } = await supabase
      .from('users')
      .update(suspensionInfo)
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erreur lors de la suspension de l'utilisateur: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('suspend_user', adminId, {
      userId: id,
      reason: suspensionData.reason,
      duration: suspensionData.duration
    });
  }
  
  // Bannir un utilisateur
  async banUser(id: string, reason: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        status: UserStatus.BANNED,
        suspension_reason: reason,
        suspended_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erreur lors du bannissement de l'utilisateur: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('ban_user', adminId, {
      userId: id,
      reason
    });
  }
  
  // Réactiver un utilisateur
  async reactivateUser(id: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        status: UserStatus.ACTIVE,
        suspension_reason: null,
        suspended_until: null,
        suspended_at: null,
        updated_at: new Date()
      })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erreur lors de la réactivation de l'utilisateur: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('reactivate_user', adminId, {
      userId: id
    });
  }
  
  // Supprimer un utilisateur (soft delete)
  async deleteUser(id: string, adminId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        status: UserStatus.BANNED,
        email: `deleted_${Date.now()}_${id}@deleted.com`,
        name: 'Utilisateur supprimé',
        updated_at: new Date()
      })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
    
    // Logger l'action admin
    await this.logAdminAction('delete_user', adminId, {
      userId: id
    });
  }
  
  // Obtenir les statistiques des utilisateurs
  async getUserStats(): Promise<UserStats> {
    const [
      totalUsersResult,
      activeUsersResult,
      suspendedUsersResult,
      newUsersTodayResult,
      newUsersThisWeekResult,
      newUsersThisMonthResult
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', UserStatus.ACTIVE),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('status', UserStatus.SUSPENDED),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);
    
    return {
      totalUsers: totalUsersResult.count || 0,
      activeUsers: activeUsersResult.count || 0,
      suspendedUsers: suspendedUsersResult.count || 0,
      newUsersToday: newUsersTodayResult.count || 0,
      newUsersThisWeek: newUsersThisWeekResult.count || 0,
      newUsersThisMonth: newUsersThisMonthResult.count || 0
    };
  }
  
  // Exporter les utilisateurs
  async exportUsers(filters: UserFilters, format: 'csv' | 'json' = 'csv'): Promise<string> {
    // Récupérer tous les utilisateurs (sans pagination)
    const users = await this.getUsers(filters, { page: 1, limit: 10000 });
    
    if (format === 'json') {
      return JSON.stringify(users.users, null, 2);
    }
    
    // Format CSV
    const headers = ['ID', 'Nom', 'Email', 'Localisation', 'Statut', 'Créé le', 'Dernière activité'];
    const rows = users.users.map(user => [
      user.id,
      user.name,
      user.email,
      user.location || '',
      user.status,
      new Date(user.created_at).toLocaleDateString('fr-FR'),
      user.last_activity_at ? new Date(user.last_activity_at).toLocaleDateString('fr-FR') : ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  // Obtenir le wallet d'un utilisateur
  async getUserWallet(userId: string): Promise<UserWallet | null> {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erreur lors de la récupération du wallet: ${error.message}`);
    }
    
    return data;
  }
  
  // Obtenir l'activité d'un utilisateur
  async getUserActivity(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération de l'activité: ${error.message}`);
    }
    
    return data || [];
  }
  
  // Rechercher des utilisateurs
  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);
    
    if (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
    
    return data || [];
  }
  
  // Obtenir les utilisateurs par localisation
  async getUsersByLocation(location: string, limit: number = 50): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('location', `%${location}%`)
      .limit(limit);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération par localisation: ${error.message}`);
    }
    
    return data || [];
  }
  
  // Obtenir les utilisateurs récents
  async getRecentUsers(limit: number = 20): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs récents: ${error.message}`);
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
