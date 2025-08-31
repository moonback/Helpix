import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';
import { sortTasksByProximity } from '@/lib/utils';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  userLocation: { latitude: number | null; longitude: number | null } | null;
  fetchTasks: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  setUserLocation: (latitude: number, longitude: number) => void;
  getTasksByProximity: () => Task[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  userLocation: null,

  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Si pas de données, utiliser des tâches mockées pour la démo
      if (!data || data.length === 0) {
        const mockTasks: Task[] = [
          {
            id: 1,
            user_id: 'user-1',
            title: 'Aide pour déménagement',
            description: 'J\'ai besoin d\'aide pour déménager mes meubles ce weekend. J\'habite au 3ème étage sans ascenseur.',
            category: 'local',
            status: 'open',
            priority: 'high',
            estimated_duration: 4,
            location: 'Paris 11ème, Rue de la Roquette',
            latitude: 48.8566,
            longitude: 2.3522,
            required_skills: ['Déménagement', 'Force physique'],
            budget_credits: 80,
            deadline: '2024-01-15T18:00:00',
            tags: ['déménagement', 'urgent', 'weekend'],
            created_at: '2024-01-10T10:00:00',
            updated_at: '2024-01-10T10:00:00'
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
            updated_at: '2024-01-09T14:30:00'
          },
          {
            id: 3,
            user_id: 'user-3',
            title: 'Réparation vélo',
            description: 'Mon vélo a un problème avec les freins. J\'ai besoin d\'aide pour le réparer ou de conseils.',
            category: 'local',
            status: 'open',
            priority: 'low',
            estimated_duration: 1,
            location: 'Lyon, Croix-Rousse',
            latitude: 45.7640,
            longitude: 4.8357,
            required_skills: ['Mécanique vélo'],
            budget_credits: 30,
            tags: ['vélo', 'réparation', 'mécanique'],
            created_at: '2024-01-08T16:45:00',
            updated_at: '2024-01-08T16:45:00'
          },
          {
            id: 4,
            user_id: 'user-4',
            title: 'Traduction anglais-français',
            description: 'J\'ai un document de 5 pages à traduire de l\'anglais vers le français. Deadline dans 3 jours.',
            category: 'remote',
            status: 'open',
            priority: 'urgent',
            estimated_duration: 3,
            location: 'En ligne',
            required_skills: ['Anglais', 'Français', 'Traduction'],
            budget_credits: 100,
            deadline: '2024-01-13T23:59:00',
            tags: ['traduction', 'anglais', 'français', 'urgent'],
            created_at: '2024-01-07T09:15:00',
            updated_at: '2024-01-07T09:15:00'
          },
          {
            id: 5,
            user_id: 'user-5',
            title: 'Jardinage et entretien',
            description: 'Je cherche quelqu\'un pour m\'aider à entretenir mon petit jardin. Arrosage, désherbage, taille des plantes.',
            category: 'local',
            status: 'open',
            priority: 'medium',
            estimated_duration: 2,
            location: 'Marseille, Le Panier',
            latitude: 43.2965,
            longitude: 5.3698,
            required_skills: ['Jardinage', 'Botanique'],
            budget_credits: 45,
            tags: ['jardinage', 'entretien', 'nature'],
            created_at: '2024-01-06T11:20:00',
            updated_at: '2024-01-06T11:20:00'
          }
        ];
        
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
  setError: (error) => set({ error })
}));
