import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Item, Rental, RentalReview, MarketplaceFilter, MarketplaceSort, ItemCategory, RentalStatus } from '@/types';

interface MarketplaceStore {
  // État
  items: Item[];
  rentals: Rental[];
  reviews: RentalReview[];
  isLoading: boolean;
  error: string | null;
  userLocation: { latitude: number | null; longitude: number | null } | null;
  
  // Filtres et tri
  filters: MarketplaceFilter;
  sort: MarketplaceSort;
  searchQuery: string;
  
  // Actions pour les objets
  fetchUserInfo: (userId: string) => Promise<any>;
  fetchItems: (filters?: MarketplaceFilter, sort?: MarketplaceSort, search?: string) => Promise<void>;
  fetchItemById: (id: number) => Promise<Item | null>;
  createItem: (itemData: Partial<Item>) => Promise<Item>;
  updateItem: (id: number, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  toggleItemAvailability: (id: number) => Promise<void>;
  
  // Actions pour les locations
  fetchRentals: (userId?: string) => Promise<void>;
  fetchRentalById: (id: string) => Promise<Rental | null>;
  requestRental: (rentalData: {
    itemId: number;
    startDate: string;
    endDate: string;
    dailyPrice: number;
    depositCredits?: number;
  }) => Promise<Rental>;
  updateRentalStatus: (id: string, status: RentalStatus) => Promise<void>;
  cancelRental: (id: string, reason?: string) => Promise<void>;
  
  // Actions pour les avis
  fetchReviews: (itemId?: number, userId?: string) => Promise<void>;
  createReview: (reviewData: {
    rentalId: string;
    itemId: number;
    revieweeId: string;
    rating: number;
    comment?: string;
  }) => Promise<RentalReview>;
  
  // Actions de filtrage et tri
  setFilters: (filters: MarketplaceFilter) => void;
  setSort: (sort: MarketplaceSort) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Actions utilitaires
  setUserLocation: (latitude: number, longitude: number) => void;
  getItemsByProximity: () => Item[];
  getFilteredItems: () => Item[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Statistiques
  getMarketplaceStats: () => {
    totalItems: number;
    availableItems: number;
    totalRentals: number;
    averageRating: number;
    categories: Record<ItemCategory, number>;
  };
}

const defaultFilters: MarketplaceFilter = {
  available_only: true,
  price_range: { min: 0, max: 1000 },
  location_radius: 50,
};

const defaultSort: MarketplaceSort = {
  field: 'created_at',
  direction: 'desc',
};

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  // État initial
  items: [],
  rentals: [],
  reviews: [],
  isLoading: false,
  error: null,
  userLocation: null,
  filters: defaultFilters,
  sort: defaultSort,
  searchQuery: '',

  // Fonction utilitaire pour récupérer les infos utilisateur
  fetchUserInfo: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
      return null;
    }
  },

  // Actions pour les objets
  fetchItems: async (filters, sort, search) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = filters || get().filters;
      const currentSort = sort || get().sort;
      const currentSearch = search || get().searchQuery;

      let query = supabase
        .from('items')
        .select('*')
        .eq('is_rentable', true);

      // Appliquer les filtres
      if (currentFilters.available_only) {
        query = query.eq('available', true);
      }

      if (currentFilters.category && currentFilters.category.length > 0) {
        query = query.in('category', currentFilters.category);
      }

      if (currentFilters.condition && currentFilters.condition.length > 0) {
        query = query.in('condition', currentFilters.condition);
      }

      if (currentFilters.price_range) {
        if (currentFilters.price_range.min > 0) {
          query = query.gte('daily_price', currentFilters.price_range.min);
        }
        if (currentFilters.price_range.max < 1000) {
          query = query.lte('daily_price', currentFilters.price_range.max);
        }
      }

      if (currentSearch) {
        query = query.or(`name.ilike.%${currentSearch}%,description.ilike.%${currentSearch}%,tags.cs.{${currentSearch}}`);
      }

      // Appliquer le tri
      query = query.order(currentSort.field, { ascending: currentSort.direction === 'asc' });

      const { data, error } = await query;

      if (error) throw error;

      // Traiter les données
      const processedItems: Item[] = (data || []).map((item: any) => ({
        ...item,
        tags: item.tags || [],
        images: item.images || [],
      }));

      set({ items: processedItems });
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors du chargement des objets' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchItemById: async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const item: Item = {
          ...data,
          tags: data.tags || [],
          images: data.images || [],
        };

        return item;
      }
      return null;
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors du chargement de l\'objet' });
      return null;
    }
  },

  createItem: async (itemData: Partial<Item>) => {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: user.id,
          name: itemData.name,
          description: itemData.description,
          category: itemData.category,
          condition: itemData.condition,
          daily_price: itemData.daily_price,
          deposit: itemData.deposit || 0,
          is_rentable: true,
          available: true,
          tags: itemData.tags || [],
          images: itemData.images || [],
          location: itemData.location,
          latitude: itemData.latitude,
          longitude: itemData.longitude,
        })
        .select()
        .single();

      if (error) throw error;

      // Rafraîchir la liste
      await get().fetchItems();
      return data;
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors de la création de l\'objet' });
      throw error;
    }
  },

  updateItem: async (id: number, updates: Partial<Item>) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          condition: updates.condition,
          daily_price: updates.daily_price,
          deposit: updates.deposit,
          available: updates.available,
          tags: updates.tags,
          images: updates.images,
          location: updates.location,
          latitude: updates.latitude,
          longitude: updates.longitude,
        })
        .eq('id', id);

      if (error) throw error;

      // Rafraîchir la liste
      await get().fetchItems();
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors de la mise à jour de l\'objet' });
      throw error;
    }
  },

  deleteItem: async (id: number) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Rafraîchir la liste
      await get().fetchItems();
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors de la suppression de l\'objet' });
      throw error;
    }
  },

  toggleItemAvailability: async (id: number) => {
    try {
      const item = get().items.find(i => i.id === id);
      if (!item) throw new Error('Objet non trouvé');

      const { error } = await supabase
        .from('items')
        .update({ available: !item.available })
        .eq('id', id);

      if (error) throw error;

      // Rafraîchir la liste
      await get().fetchItems();
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors de la mise à jour de la disponibilité' });
      throw error;
    }
  },

  // Actions pour les locations
  fetchRentals: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('rentals')
        .select(`
          *,
          items!rentals_item_id_fkey (
            id,
            name,
            description,
            images,
            daily_price
          ),
          owner:users!rentals_owner_id_fkey (
            id,
            name,
            avatar_url
          ),
          renter:users!rentals_renter_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.or(`owner_id.eq.${userId},renter_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedRentals: Rental[] = (data || []).map((rental: any) => ({
        ...rental,
        item: rental.items,
        owner: rental.owner,
        renter: rental.renter,
      }));

      set({ rentals: processedRentals });
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors du chargement des locations' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRentalById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          items!rentals_item_id_fkey (
            id,
            name,
            description,
            images,
            daily_price
          ),
          owner:users!rentals_owner_id_fkey (
            id,
            name,
            avatar_url
          ),
          renter:users!rentals_renter_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        return {
          ...data,
          item: data.items,
          owner: data.owner,
          renter: data.renter,
        };
      }
      return null;
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors du chargement de la location' });
      return null;
    }
  },

  requestRental: async (rentalData) => {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer les informations de l'objet pour obtenir l'owner_id
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('user_id')
        .eq('id', rentalData.itemId)
        .single();

      if (itemError || !itemData) {
        throw new Error('Objet non trouvé');
      }

      const totalDays = Math.max(1, Math.ceil(
        (new Date(rentalData.endDate).getTime() - new Date(rentalData.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ));
      const totalCredits = totalDays * rentalData.dailyPrice;

      const { data, error } = await supabase
        .from('rentals')
        .insert({
          item_id: rentalData.itemId,
          owner_id: itemData.user_id, // ID du propriétaire de l'objet
          renter_id: user.id, // ID de l'utilisateur qui fait la demande
          start_date: rentalData.startDate,
          end_date: rentalData.endDate,
          daily_price: rentalData.dailyPrice,
          total_credits: totalCredits,
          deposit_credits: rentalData.depositCredits || 0,
          status: 'requested',
        })
        .select()
        .single();

      if (error) throw error;

      // Rafraîchir les locations
      await get().fetchRentals();
      return data;
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors de la demande de location' });
      throw error;
    }
  },

  updateRentalStatus: async (id: string, status: RentalStatus) => {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer la location pour vérifier que l'utilisateur est le propriétaire
      const { data: rentalData, error: fetchError } = await supabase
        .from('rentals')
        .select('owner_id, status')
        .eq('id', id)
        .single();

      if (fetchError || !rentalData) {
        throw new Error('Location non trouvée');
      }

      // Vérifier que l'utilisateur est le propriétaire
      if (rentalData.owner_id !== user.id) {
        throw new Error('Seul le propriétaire peut modifier le statut de la location');
      }

      // Vérifier que le changement de statut est valide
      const validStatusTransitions: Record<string, string[]> = {
        'requested': ['accepted', 'cancelled'], // Pas de "rejected", on utilise "cancelled"
        'accepted': ['active', 'cancelled'],
        'active': ['completed', 'cancelled'],
        'cancelled': [],
        'completed': []
      };

      const currentStatus = rentalData.status;
      if (!validStatusTransitions[currentStatus]?.includes(status)) {
        throw new Error(`Impossible de changer le statut de "${currentStatus}" vers "${status}"`);
      }

      const { error } = await supabase
        .from('rentals')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Rafraîchir les locations
      await get().fetchRentals();
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors de la mise à jour du statut' });
      throw error;
    }
  },

  cancelRental: async (id: string, reason?: string) => {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer la location pour vérifier les permissions
      const { data: rentalData, error: fetchError } = await supabase
        .from('rentals')
        .select('owner_id, renter_id, status')
        .eq('id', id)
        .single();

      if (fetchError || !rentalData) {
        throw new Error('Location non trouvée');
      }

      // Vérifier que l'utilisateur est soit le propriétaire soit le locataire
      if (rentalData.owner_id !== user.id && rentalData.renter_id !== user.id) {
        throw new Error('Seul le propriétaire ou le locataire peut annuler cette location');
      }

      // Vérifier que l'annulation est possible selon le statut actuel
      const cancellableStatuses = ['requested', 'accepted', 'active'];
      if (!cancellableStatuses.includes(rentalData.status)) {
        throw new Error(`Impossible d'annuler une location avec le statut "${rentalData.status}"`);
      }

      const updateData: any = { 
        status: 'cancelled',
      };
      
      // Ajouter la raison si fournie (quand le champ sera ajouté à la DB)
      if (reason) {
        // updateData.cancellation_reason = reason;
        console.log('Raison d\'annulation:', reason);
      }

      const { error } = await supabase
        .from('rentals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Rafraîchir les locations
      await get().fetchRentals();
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors de l\'annulation de la location' });
      throw error;
    }
  },

  // Actions pour les avis
  fetchReviews: async (itemId?: number, userId?: string) => {
    try {
      let query = supabase
        .from('rental_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      if (userId) {
        query = query.or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedReviews: RentalReview[] = (data || []).map((review: any) => ({
        ...review,
      }));

      set({ reviews: processedReviews });
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors du chargement des avis' });
    }
  },

  createReview: async (reviewData) => {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { data, error } = await supabase
        .from('rental_reviews')
        .insert({
          rental_id: reviewData.rentalId,
          item_id: reviewData.itemId,
          reviewer_id: user.id,
          reviewee_id: reviewData.revieweeId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        })
        .select()
        .single();

      if (error) throw error;

      // Rafraîchir les avis
      await get().fetchReviews();
      return data;
    } catch (error: any) {
      set({ error: error.message || 'Erreur lors de la création de l\'avis' });
      throw error;
    }
  },

  // Actions de filtrage et tri
  setFilters: (filters: MarketplaceFilter) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  setSort: (sort: MarketplaceSort) => {
    set({ sort });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearFilters: () => {
    set({ filters: defaultFilters, searchQuery: '' });
  },

  // Actions utilitaires
  setUserLocation: (latitude: number, longitude: number) => {
    set({ userLocation: { latitude, longitude } });
  },

  getItemsByProximity: () => {
    const { items, userLocation } = get();
    if (!userLocation?.latitude || !userLocation?.longitude) return items;

    return items
      .filter(item => item.latitude && item.longitude)
      .map(item => ({
        ...item,
        distance: calculateDistance(
          userLocation.latitude!,
          userLocation.longitude!,
          item.latitude!,
          item.longitude!
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  },

  getFilteredItems: () => {
    const { items, filters, searchQuery } = get();
    let filtered = [...items];

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtre par catégorie
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(item => filters.category!.includes(item.category));
    }

    // Filtre par condition
    if (filters.condition && filters.condition.length > 0) {
      filtered = filtered.filter(item => filters.condition!.includes(item.condition));
    }

    // Filtre par prix
    if (filters.price_range) {
      filtered = filtered.filter(item => {
        const price = item.daily_price || 0;
        return price >= filters.price_range!.min && price <= filters.price_range!.max;
      });
    }

    // Filtre par disponibilité
    if (filters.available_only) {
      filtered = filtered.filter(item => item.available);
    }

    // Filtre par note minimale
    if (filters.rating_min) {
      filtered = filtered.filter(item => (item.average_rating || 0) >= filters.rating_min!);
    }

    return filtered;
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  // Statistiques
  getMarketplaceStats: () => {
    const { items } = get();
    const stats = {
      totalItems: items.length,
      availableItems: items.filter(item => item.available).length,
      totalRentals: items.reduce((sum, item) => sum + (item.total_rentals || 0), 0),
      averageRating: 0,
      categories: {} as Record<ItemCategory, number>,
    };

    // Calculer la note moyenne
    const itemsWithRating = items.filter(item => item.average_rating);
    if (itemsWithRating.length > 0) {
      stats.averageRating = itemsWithRating.reduce((sum, item) => sum + (item.average_rating || 0), 0) / itemsWithRating.length;
    }

    // Compter par catégorie
    const categories: ItemCategory[] = ['tools', 'vehicles', 'sports', 'electronics', 'home', 'garden', 'books', 'clothing', 'musical', 'photography', 'outdoor', 'other'];
    categories.forEach(category => {
      stats.categories[category] = items.filter(item => item.category === category).length;
    });

    return stats;
  },
}));

// Fonction utilitaire pour calculer la distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
