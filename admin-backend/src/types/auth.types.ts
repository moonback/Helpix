import { Request } from 'express';

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  ANALYST = 'analyst'
}

export enum Permission {
  // Gestion des utilisateurs
  VIEW_USERS = 'view_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  BAN_USERS = 'ban_users',
  
  // Gestion des tâches
  VIEW_TASKS = 'view_tasks',
  EDIT_TASKS = 'edit_tasks',
  DELETE_TASKS = 'delete_tasks',
  MODERATE_TASKS = 'moderate_tasks',
  
  // Gestion financière
  VIEW_TRANSACTIONS = 'view_transactions',
  PROCESS_WITHDRAWALS = 'process_withdrawals',
  MANAGE_CREDITS = 'manage_credits',
  
  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
  
  // Configuration système
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_LOGS = 'view_logs',
  MANAGE_NOTIFICATIONS = 'manage_notifications'
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  admin: Omit<AdminUser, 'permissions'>;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthRequest extends Request {
  admin?: AdminUser;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: AdminRole;
  iat: number;
  exp: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
