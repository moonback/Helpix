import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Task, TaskComment, TaskDashboard, TaskFilter, TaskSort } from '@/types';
import { sortTasksByProximity } from '@/lib/utils';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  userLocation: { latitude: number | null; longitude: number | null } | null;
  
  // Actions de base
  fetchTasks: () => Promise<void>;
  fetchAllTasks: () => Promise<void>;
  fetchMyAssignedTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  
  // Actions de suivi avancé
  updateTaskProgress: (id: number, progress: number, step?: string) => Promise<void>;
  logTimeSpent: (id: number, minutes: number) => Promise<void>;
  addTaskComment: (taskId: number, comment: Omit<TaskComment, 'id' | 'created_at'>) => Promise<void>;
  updateTaskStatus: (id: number, status: Task['status'], reason?: string) => Promise<void>;
  assignTask: (id: number, userId: string) => Promise<void>;
  addTaskAttachment: (taskId: number, file: File, description?: string) => Promise<void>;
  removeTaskAttachment: (taskId: number, attachmentId: string) => Promise<void>;
  
  // Actions de filtrage et tri
  filterTasks: (filters: TaskFilter) => Task[];
  sortTasks: (tasks: Task[], sort: TaskSort) => Task[];
  searchTasks: (query: string) => Task[];
  
  // Actions de tableau de bord
  getDashboardData: () => TaskDashboard;
  getTasksByStatus: (status: Task['status']) => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingDeadlines: (days: number) => Task[];
  
  // Actions utilitaires
  setUserLocation: (latitude: number, longitude: number) => void;
  getTasksByProximity: () => Task[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // État local
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  taskFilters: TaskFilter;
  setTaskFilters: (filters: TaskFilter) => void;
  taskSort: TaskSort;
  setTaskSort: (sort: TaskSort) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  userLocation: null,
  selectedTask: null,
  taskFilters: {},
  taskSort: { field: 'created_at', direction: 'desc' },

  fetchAllTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer TOUTES les tâches (pour le tableau de bord)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ tasks: data || [] });
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les tâches:', error);
      set({ error: 'Erreur lors de la récupération des tâches' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyAssignedTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      if (!currentUserId) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer uniquement les tâches assignées à l'utilisateur connecté
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ tasks: data || [] });
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches assignées:', error);
      set({ error: 'Erreur lors de la récupération des tâches assignées' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      if (!currentUserId) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer les tâches non assignées OU assignées à l'utilisateur connecté
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`assigned_to.is.null,assigned_to.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Si pas de données, utiliser des tâches mockées pour la démo
      if (!data || data.length === 0) {
        const allMockTasks: Task[] = [
          {
            id: 1,
            user_id: 'user-1',
            title: 'Aide pour déménagement',
            description: 'J\'ai besoin d\'aide pour déménager mes meubles ce weekend. J\'habite au 3ème étage sans ascenseur.',
            category: 'local',
            status: 'in_progress',
            priority: 'high',
            estimated_duration: 4,
            actual_duration: 2.5,
            location: 'Paris 11ème, Rue de la Roquette',
            latitude: 48.8566,
            longitude: 2.3522,
            required_skills: ['Déménagement', 'Force physique'],
            budget_credits: 80,
            deadline: '2024-01-15T18:00:00',
            tags: ['déménagement', 'urgent', 'weekend'],
            created_at: '2024-01-10T10:00:00',
            updated_at: '2024-01-10T10:00:00',
            progress_percentage: 65,
            current_step: 'Emballage des objets fragiles',
            total_steps: 5,
            completed_steps: 3,
            time_spent: 150,

            is_overdue: false,
            complexity: 'moderate',
            assigned_to: 'user-2'
          },
          {
            id: 2,
            user_id: 'user-2',
            title: 'Cours de cuisine italienne',
            description: 'Je propose des cours de cuisine italienne à distance. Apprenez à faire des pâtes fraîches et des sauces authentiques !',
            category: 'remote',
            status: 'open',
            priority: 'medium',
            estimated_duration: 2,
            location: 'En ligne',
            required_skills: ['Cuisine', 'Italien'],
            budget_credits: 60,
            tags: ['cuisine', 'italien', 'cours'],
            created_at: '2024-01-09T14:30:00',
            updated_at: '2024-01-09T14:30:00',
            progress_percentage: 0,
            total_steps: 3,
            completed_steps: 0,
            time_spent: 0,

            is_overdue: false,
            complexity: 'simple'
          },
          {
            id: 3,
            user_id: 'user-3',
            title: 'Réparation vélo',
            description: 'Mon vélo a un problème avec les freins. J\'ai besoin d\'aide pour le réparer ou de conseils.',
            category: 'local',
            status: 'completed',
            priority: 'low',
            estimated_duration: 1,
            actual_duration: 1.5,
            location: 'Lyon, Croix-Rousse',
            latitude: 45.7640,
            longitude: 4.8357,
            required_skills: ['Mécanique vélo'],
            budget_credits: 30,
            tags: ['vélo', 'réparation', 'mécanique'],
            created_at: '2024-01-08T16:45:00',
            updated_at: '2024-01-10T12:00:00',
            completion_date: '2024-01-10T12:00:00',
            rating: 5,
            feedback: 'Excellent travail, vélo parfaitement réparé !',
            progress_percentage: 100,
            total_steps: 3,
            completed_steps: 3,
            time_spent: 90,

            is_overdue: false,
            complexity: 'simple',
            assigned_to: 'user-4'
          },
          {
            id: 4,
            user_id: 'user-4',
            title: 'Traduction anglais-français',
            description: 'J\'ai un document de 5 pages à traduire de l\'anglais vers le français. Deadline dans 3 jours.',
            category: 'remote',
            status: 'on_hold',
            priority: 'urgent',
            estimated_duration: 3,
            location: 'En ligne',
            required_skills: ['Anglais', 'Français', 'Traduction'],
            budget_credits: 100,
            deadline: '2024-01-13T23:59:00',
            tags: ['traduction', 'anglais', 'français', 'urgent'],
            created_at: '2024-01-07T09:15:00',
            updated_at: '2024-01-11T10:00:00',
            progress_percentage: 30,
            current_step: 'Révision de la traduction',
            total_steps: 4,
            completed_steps: 1,
            time_spent: 120,

            is_overdue: true,
            complexity: 'complex',
            assigned_to: 'user-5'
          },
          {
            id: 5,
            user_id: 'user-5',
            title: 'Jardinage et entretien',
            description: 'Je cherche quelqu\'un pour m\'aider à entretenir mon petit jardin. Arrosage, désherbage, taille des plantes.',
            category: 'local',
            status: 'review',
            priority: 'medium',
            estimated_duration: 2,
            actual_duration: 2.2,
            location: 'Marseille, Le Panier',
            latitude: 43.2965,
            longitude: 5.3698,
            required_skills: ['Jardinage', 'Botanique'],
            budget_credits: 45,
            tags: ['jardinage', 'entretien', 'nature'],
            created_at: '2024-01-06T11:20:00',
            updated_at: '2024-01-12T16:00:00',
            progress_percentage: 95,
            current_step: 'Validation finale',
            total_steps: 4,
            completed_steps: 4,
            time_spent: 132,

            is_overdue: false,
            complexity: 'moderate',
            assigned_to: 'user-1'
          }
        ];
        
        // Filtrer les tâches mockées selon l'utilisateur connecté
        const mockTasks = allMockTasks.filter(task => 
          !task.assigned_to || task.assigned_to === currentUserId
        );
        
        set({ tasks: mockTasks });
      } else {
        set({ tasks: data });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      set({ error: 'Erreur lors de la récupération des tâches' });
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      // Ajouter la nouvelle tâche à la liste
      set(state => ({
        tasks: [data, ...state.tasks]
      }));
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      set({ error: 'Erreur lors de la création de la tâche' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTask: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour la tâche dans la liste
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...data } : task
        )
      }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      set({ error: 'Erreur lors de la mise à jour de la tâche' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTask: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Supprimer la tâche de la liste
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      set({ error: 'Erreur lors de la suppression de la tâche' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Nouvelles actions de suivi
  updateTaskProgress: async (id, progress, step) => {
    try {
      const updates: Partial<Task> = {
        progress_percentage: Math.max(0, Math.min(100, progress)),
        updated_at: new Date().toISOString(),

      };

      if (step) {
        updates.current_step = step;
        updates.completed_steps = Math.floor((progress / 100) * (get().tasks.find(t => t.id === id)?.total_steps || 1));
      }

      await get().updateTask(id, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du progrès:', error);
      throw error;
    }
  },

  logTimeSpent: async (id, minutes) => {
    try {
      const task = get().tasks.find(t => t.id === id);
      if (!task) throw new Error('Tâche non trouvée');

      const newTimeSpent = (task.time_spent || 0) + minutes;
      await get().updateTask(id, {
        time_spent: newTimeSpent,
        actual_duration: newTimeSpent / 60, // Convertir en heures
        updated_at: new Date().toISOString(),

      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du temps:', error);
      throw error;
    }
  },

  addTaskComment: async (taskId, comment) => {
    try {
      const newComment: TaskComment = {
        ...comment,
        id: `comment_${Date.now()}`,
        created_at: new Date().toISOString()
      };

      // En production, sauvegarder dans la base de données
      console.log('Commentaire ajouté:', newComment);
      
      // Mettre à jour la tâche avec le nouveau commentaire
      const task = get().tasks.find(t => t.id === taskId);
      if (task) {
        const updatedComments = [...(task.comments || []), newComment];
        await get().updateTask(taskId, {
          comments: updatedComments,
  
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      throw error;
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      const updates: Partial<Task> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.completion_date = new Date().toISOString();
        updates.progress_percentage = 100;
      }

      await get().updateTask(id, updates);

      // Traiter le paiement automatique quand la tâche est terminée
      if (status === 'completed') {
        const task = get().tasks.find(t => t.id === id);
        if (task && task.assigned_to && task.budget_credits > 0) {
          try {
            // Vérifier si le paiement a déjà été traité pour cette tâche
            const { hasTaskPaymentBeenProcessed, processTaskPayment } = await import('@/lib/creditUtils');
            
            const paymentAlreadyProcessed = await hasTaskPaymentBeenProcessed(id);
            if (!paymentAlreadyProcessed) {
              const success = await processTaskPayment(
                task.user_id,        // Propriétaire de la tâche (qui paie)
                task.assigned_to,    // Utilisateur qui a aidé (qui reçoit)
                id,                  // ID de la tâche
                task.budget_credits, // Montant à transférer
                task.title           // Titre de la tâche
              );
              
              if (success) {
                // Rafraîchir les stores wallet des utilisateurs concernés
                const { useAuthStore } = await import('@/stores/authStore');
                const { user } = useAuthStore.getState();
                if (user) {
                  const { useWalletStore } = await import('@/features/wallet/stores/walletStore');
                  const walletStore = useWalletStore.getState();
                  await walletStore.fetchWallet();
                }

                // Afficher une notification de succès
                try {
                  const { usePaymentNotifications } = await import('@/hooks/usePaymentNotifications');
                  // Note: Les notifications seront gérées par le composant qui utilise le hook
                  console.log(`✅ Paiement traité avec succès: ${task.budget_credits} crédits transférés pour "${task.title}"`);
                } catch (notificationError) {
                  console.warn('Impossible d\'afficher la notification:', notificationError);
                }
              }
            } else {
              console.log(`ℹ️ Le paiement a déjà été traité pour la tâche ${id}`);
            }
          } catch (walletError) {
            console.error('Erreur lors du traitement du paiement automatique:', walletError);
            // Ne pas faire échouer le changement de statut si le crédit échoue
          }
        }
      }

      // Commentaire automatique désactivé pour éviter les erreurs de colonne manquante
      // if (reason) {
      //   await get().addTaskComment(id, {
      //     task_id: id,
      //     user_id: 'system',
      //     content: `Statut changé vers "${status}": ${reason}`,
      //     type: 'progress_update',
      //     is_internal: false
      //   });
      // }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      throw error;
    }
  },

  assignTask: async (id, userId) => {
    try {
      await get().updateTask(id, {
        assigned_to: userId,
        updated_at: new Date().toISOString(),

      });

      // Commentaire automatique désactivé pour éviter les erreurs de colonne manquante
      // await get().addTaskComment(id, {
      //   task_id: id,
      //   user_id: 'system',
      //   content: `Tâche assignée à l'utilisateur ${userId}`,
      //   type: 'progress_update',
      //   is_internal: false
      // });
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      throw error;
    }
  },

  addTaskAttachment: async (taskId, file, description) => {
    try {
      // En production, uploader le fichier et récupérer l'URL
      const attachment = {
        id: `attachment_${Date.now()}`,
        task_id: taskId,
        file_name: file.name,
        file_url: URL.createObjectURL(file), // Temporaire pour la démo
        file_type: file.type,
        file_size: file.size,
        uploaded_by: 'current_user', // À remplacer par l'ID réel
        uploaded_at: new Date().toISOString(),
        description
      };

      const task = get().tasks.find(t => t.id === taskId);
      if (task) {
        const updatedAttachments = [...(task.attachments || []), attachment];
        await get().updateTask(taskId, {
          attachments: updatedAttachments,
  
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la pièce jointe:', error);
      throw error;
    }
  },

  removeTaskAttachment: async (taskId, attachmentId) => {
    try {
      const task = get().tasks.find(t => t.id === taskId);
      if (task) {
        const updatedAttachments = task.attachments?.filter(a => a.id !== attachmentId) || [];
        await get().updateTask(taskId, {
          attachments: updatedAttachments,
  
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce jointe:', error);
      throw error;
    }
  },

  // Actions de filtrage et tri
  filterTasks: (filters) => {
    let filteredTasks = get().tasks;

    if (filters.status && filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.status!.includes(task.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.priority!.includes(task.priority));
    }

    if (filters.category && filters.category.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.category!.includes(task.category));
    }

    if (filters.assigned_to) {
      filteredTasks = filteredTasks.filter(task => task.assigned_to === filters.assigned_to);
    }

    if (filters.created_by) {
      filteredTasks = filteredTasks.filter(task => task.user_id === filters.created_by);
    }

    if (filters.complexity && filters.complexity.length > 0) {
      filteredTasks = filteredTasks.filter(task => filters.complexity!.includes(task.complexity));
    }

    return filteredTasks;
  },

  sortTasks: (tasks, sort) => {
    const sortedTasks = [...tasks];
    
    sortedTasks.sort((a, b) => {
      let aValue: any = (a as any)[sort.field];
      let bValue: any = (b as any)[sort.field];

      if (sort.field === 'progress') {
        aValue = (a as any).progress_percentage || 0;
        bValue = (b as any).progress_percentage || 0;
      }

      if (typeof aValue === 'string') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sortedTasks;
  },

  searchTasks: (query) => {
    const searchTerm = query.toLowerCase();
    return get().tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm) ||
      task.location.toLowerCase().includes(searchTerm) ||
      task.required_skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  },

  // Actions de tableau de bord
  getDashboardData: () => {
    const tasks = get().tasks;
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    const dashboard: TaskDashboard = {
      total_tasks: tasks.length,
      completed_tasks: tasks.filter(t => t.status === 'completed').length,
      in_progress_tasks: tasks.filter(t => t.status === 'in_progress').length,
      overdue_tasks: tasks.filter(t => t.is_overdue).length,
      upcoming_deadlines: tasks.filter(t => 
        t.deadline && new Date(t.deadline) <= threeDaysFromNow && t.status !== 'completed'
      ),
      recent_activity: [], // À implémenter avec l'historique
      performance_metrics: {
        completion_rate: tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0,
        average_completion_time: 0, // À calculer
        on_time_completion_rate: 0, // À calculer
        quality_average: 0 // À calculer
      }
    };

    return dashboard;
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter(task => task.status === status);
  },

  getOverdueTasks: () => {
    return get().tasks.filter(task => task.is_overdue);
  },

  getUpcomingDeadlines: (days) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return get().tasks.filter(task => 
      task.deadline && 
      new Date(task.deadline) <= futureDate && 
      task.status !== 'completed'
    );
  },

  setUserLocation: (latitude, longitude) => {
    set({ userLocation: { latitude, longitude } });
  },

  getTasksByProximity: () => {
    const { tasks, userLocation } = get();
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return tasks;
    }

    return sortTasksByProximity(tasks, userLocation.latitude, userLocation.longitude);
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setTaskFilters: (filters) => set({ taskFilters: filters }),
  setTaskSort: (sort) => set({ taskSort: sort })
}));
