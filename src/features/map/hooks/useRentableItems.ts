import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface RentableItem {
  id: number;
  name: string;
  description: string;
  daily_price: number | null;
  deposit: number;
  available: boolean;
  owner_id: string;
  location: { lat: number; lng: number } | null;
}

export function useRentableItems() {
  const [items, setItems] = useState<RentableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: items, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_rentable', true);
      if (error) throw error;

      const ownerIds = Array.from(new Set((items || []).map((i: any) => i.user_id)));
      const ownersLocationMap = new Map<string, { lat: number; lng: number } | null>();

      if (ownerIds.length > 0) {
        const { data: usersRows, error: usersErr } = await supabase
          .from('users')
          .select('id, location')
          .in('id', ownerIds);
        if (usersErr) throw usersErr;
        (usersRows || []).forEach((u: any) => {
          const parts = String(u.location || '').split(',');
          if (parts.length === 2) {
            const lat = Number(parts[0]);
            const lng = Number(parts[1]);
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
              ownersLocationMap.set(u.id, { lat, lng });
              return;
            }
          }
          ownersLocationMap.set(u.id, null);
        });
      }

      const mapped: RentableItem[] = (items || []).map((it: any) => ({
        id: it.id,
        name: it.name ?? it.item_name,
        description: it.description || '',
        daily_price: it.daily_price ?? null,
        deposit: it.deposit ?? 0,
        available: !!it.available,
        owner_id: it.user_id,
        location: ownersLocationMap.get(it.user_id) ?? null,
      }));
      setItems(mapped.filter(m => m.location));
    } catch (e: any) {
      setError(e?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, loading, error, refresh: fetchItems };
}
