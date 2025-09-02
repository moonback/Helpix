export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number;
  longitude: number;
  status: TaskStatus;
  priority: TaskPriority;
  budget: number;
  currency: string;
  deadline?: Date;
  assigned_to?: string;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
  is_paid: boolean;
  payment_status: PaymentStatus;
  tags: string[];
  images: string[];
  estimated_duration?: number;
  actual_duration?: number;
  rating?: number;
  feedback?: string;
}

export enum TaskStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface TaskFilters {
  status?: TaskStatus;
  category?: string;
  priority?: TaskPriority;
  location?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  budgetMin?: number;
  budgetMax?: number;
  isPaid?: boolean;
  assignedTo?: string;
  search?: string;
}

export interface TaskPagination {
  page: number;
  limit: number;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TaskStats {
  totalTasks: number;
  openTasks: number;
  assignedTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  totalBudget: number;
  averageBudget: number;
  completionRate: number;
}

export interface TaskUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  budget?: number;
  deadline?: Date;
  assigned_to?: string;
  tags?: string[];
  is_paid?: boolean;
}

export interface TaskAssignment {
  task_id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: Date;
  notes?: string;
}

export interface TaskCompletion {
  task_id: string;
  completed_by: string;
  completed_at: Date;
  rating?: number;
  feedback?: string;
  images?: string[];
  actual_duration?: number;
}

export interface TaskCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: Date;
}

export interface TaskAnalytics {
  tasksByStatus: Record<TaskStatus, number>;
  tasksByCategory: Record<string, number>;
  tasksByPriority: Record<TaskPriority, number>;
  tasksByLocation: Array<{
    location: string;
    count: number;
    latitude: number;
    longitude: number;
  }>;
  averageCompletionTime: number;
  topPerformers: Array<{
    user_id: string;
    name: string;
    completed_tasks: number;
    average_rating: number;
  }>;
}
