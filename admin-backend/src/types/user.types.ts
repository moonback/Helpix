export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  location?: string;
  status: UserStatus;
  phone?: string;
  bio?: string;
  rating: number;
  total_tasks: number;
  completed_tasks: number;
  created_at: Date;
  updated_at: Date;
  last_activity_at?: Date;
  email_verified: boolean;
  phone_verified: boolean;
  suspension_reason?: string;
  suspended_until?: Date;
  suspended_at?: Date;
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  PENDING_VERIFICATION = 'pending_verification'
}

export interface UserFilters {
  status?: UserStatus;
  location?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  search?: string;
}

export interface UserPagination {
  page: number;
  limit: number;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface UserSuspensionRequest {
  reason: string;
  duration?: number; // en millisecondes
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  location?: string;
  phone?: string;
  bio?: string;
  status?: UserStatus;
}

export interface UserExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters?: UserFilters;
  fields?: string[];
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface UserWallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: Date;
  updated_at: Date;
}
