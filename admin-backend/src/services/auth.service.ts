import { supabase } from '../config/database.config';
import { 
  AdminUser, 
  LoginRequest, 
  LoginResponse, 
  AdminRole, 
  Permission,
  JwtPayload 
} from '../types';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateRefreshToken,
  verifyRefreshToken 
} from '../utils/helpers';
import { logSecurityEvent } from '../utils/logger';

export class AuthService {
  // Authentification admin
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { email, password } = credentials;
    
    // Récupérer l'admin
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();
    
    if (error || !admin) {
      logSecurityEvent('login_failed', {
        email,
        reason: 'user_not_found',
        ip: 'unknown' // TODO: Passer l'IP depuis le middleware
      });
      
      throw new Error('Identifiants invalides');
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, admin.password_hash);
    
    if (!isPasswordValid) {
      logSecurityEvent('login_failed', {
        email,
        reason: 'invalid_password',
        adminId: admin.id,
        ip: 'unknown'
      });
      
      throw new Error('Identifiants invalides');
    }
    
    // Générer les tokens
    const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      id: admin.id,
      email: admin.email,
      role: admin.role
    };
    
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(admin.id);
    
    // Créer une session
    await this.createSession(admin.id, refreshToken);
    
    // Mettre à jour la dernière connexion
    await supabase
      .from('admin_users')
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', admin.id);
    
    // Logger la connexion réussie
    logSecurityEvent('login_success', {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      ip: 'unknown'
    });
    
    return {
      success: true,
      token,
      refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.is_active,
        lastLoginAt: new Date(admin.last_login_at),
        createdAt: new Date(admin.created_at),
        updatedAt: new Date(admin.updated_at)
      },
      expiresIn: 24 * 60 * 60 * 1000 // 24 heures en millisecondes
    };
  }
  
  // Rafraîchir le token
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      
      // Vérifier que la session existe et est active
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('admin_id', decoded.userId)
        .eq('refresh_token', refreshToken)
        .eq('is_active', true)
        .single();
      
      if (error || !session) {
        throw new Error('Session invalide');
      }
      
      // Vérifier l'expiration
      if (new Date() > new Date(session.expires_at)) {
        await this.invalidateSession(session.id);
        throw new Error('Session expirée');
      }
      
      // Récupérer l'admin
      const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single();
      
      if (adminError || !admin) {
        throw new Error('Utilisateur admin invalide');
      }
      
      // Générer de nouveaux tokens
      const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        id: admin.id,
        email: admin.email,
        role: admin.role
      };
      
      const newToken = generateToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(admin.id);
      
      // Mettre à jour la session
      await supabase
        .from('admin_sessions')
        .update({
          refresh_token: newRefreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
      
      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
      
    } catch (error) {
      logSecurityEvent('token_refresh_failed', {
        refreshToken: refreshToken.substring(0, 20) + '...',
        error: error.message
      });
      
      throw new Error('Token de rafraîchissement invalide');
    }
  }
  
  // Déconnexion
  async logout(adminId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Invalider la session spécifique
      const { data: session } = await supabase
        .from('admin_sessions')
        .select('id')
        .eq('admin_id', adminId)
        .eq('refresh_token', refreshToken)
        .eq('is_active', true)
        .single();
      
      if (session) {
        await this.invalidateSession(session.id);
      }
    } else {
      // Invalider toutes les sessions de l'admin
      await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('admin_id', adminId);
    }
    
    logSecurityEvent('logout', {
      adminId
    });
  }
  
  // Créer une session
  private async createSession(adminId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    await supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminId,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        created_at: new Date().toISOString()
      });
  }
  
  // Invalider une session
  private async invalidateSession(sessionId: string): Promise<void> {
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);
  }
  
  // Vérifier les permissions
  async checkPermission(adminId: string, permission: Permission): Promise<boolean> {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('permissions')
      .eq('id', adminId)
      .eq('is_active', true)
      .single();
    
    if (error || !admin) {
      return false;
    }
    
    return admin.permissions.includes(permission);
  }
  
  // Changer le mot de passe
  async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Récupérer l'admin
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('password_hash')
      .eq('id', adminId)
      .single();
    
    if (error || !admin) {
      throw new Error('Utilisateur admin non trouvé');
    }
    
    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await comparePassword(currentPassword, admin.password_hash);
    
    if (!isCurrentPasswordValid) {
      logSecurityEvent('password_change_failed', {
        adminId,
        reason: 'invalid_current_password'
      });
      
      throw new Error('Mot de passe actuel incorrect');
    }
    
    // Hasher le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword);
    
    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);
    
    if (updateError) {
      throw new Error('Erreur lors de la mise à jour du mot de passe');
    }
    
    // Invalider toutes les sessions existantes
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('admin_id', adminId);
    
    logSecurityEvent('password_changed', {
      adminId
    });
  }
  
  // Réinitialiser le mot de passe
  async resetPassword(email: string): Promise<void> {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();
    
    if (error || !admin) {
      // Ne pas révéler si l'email existe ou non
      return;
    }
    
    // Générer un token de réinitialisation
    const resetToken = generateRefreshToken(admin.id);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
    
    // Stocker le token de réinitialisation
    await supabase
      .from('password_reset_tokens')
      .insert({
        admin_id: admin.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false,
        created_at: new Date().toISOString()
      });
    
    // TODO: Envoyer l'email de réinitialisation
    console.log(`Token de réinitialisation pour ${email}: ${resetToken}`);
    
    logSecurityEvent('password_reset_requested', {
      adminId: admin.id,
      email: admin.email
    });
  }
  
  // Confirmer la réinitialisation du mot de passe
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    // Vérifier le token
    const { data: resetToken, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();
    
    if (error || !resetToken) {
      throw new Error('Token de réinitialisation invalide');
    }
    
    // Vérifier l'expiration
    if (new Date() > new Date(resetToken.expires_at)) {
      throw new Error('Token de réinitialisation expiré');
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);
    
    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.admin_id);
    
    if (updateError) {
      throw new Error('Erreur lors de la mise à jour du mot de passe');
    }
    
    // Marquer le token comme utilisé
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);
    
    // Invalider toutes les sessions existantes
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('admin_id', resetToken.admin_id);
    
    logSecurityEvent('password_reset_completed', {
      adminId: resetToken.admin_id
    });
  }
  
  // Créer un nouvel admin
  async createAdmin(adminData: {
    email: string;
    name: string;
    password: string;
    role: AdminRole;
    permissions: Permission[];
  }): Promise<AdminUser> {
    // Vérifier que l'email n'existe pas déjà
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', adminData.email.toLowerCase())
      .single();
    
    if (existingAdmin) {
      throw new Error('Un admin avec cet email existe déjà');
    }
    
    // Hasher le mot de passe
    const hashedPassword = await hashPassword(adminData.password);
    
    // Créer l'admin
    const { data: admin, error } = await supabase
      .from('admin_users')
      .insert({
        email: adminData.email.toLowerCase(),
        name: adminData.name,
        password_hash: hashedPassword,
        role: adminData.role,
        permissions: adminData.permissions,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw new Error('Erreur lors de la création de l\'admin');
    }
    
    logSecurityEvent('admin_created', {
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    });
    
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.is_active,
      lastLoginAt: admin.last_login_at ? new Date(admin.last_login_at) : new Date(),
      createdAt: new Date(admin.created_at),
      updatedAt: new Date(admin.updated_at)
    };
  }
}
