import React, { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { listMyRentals, updateRentalStatus } from '@/lib/rentals';
import { useAuthStore } from '@/stores/authStore';

type Rental = {
  id: string;
  item_id: number;
  owner_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  daily_price: number;
  total_credits: number;
  deposit_credits: number;
  status: 'requested' | 'accepted' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

const RentalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await listMyRentals(user.id);
        setRentals(data as unknown as Rental[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const setStatus = async (id: string, status: Rental['status']) => {
    try {
      const updated = await updateRentalStatus(id, status);
      setRentals(prev => prev.map(r => r.id === id ? { ...(r as any), status: updated.status } : r));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold mb-4">Locations</h1>

      <Card className="p-4">
        {loading ? (
          <div>Chargement...</div>
        ) : rentals.length === 0 ? (
          <div className="text-slate-600">Aucune location</div>
        ) : (
          <div className="space-y-3">
            {rentals.map(r => (
              <div key={r.id} className="rounded-2xl border p-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-semibold">Objet #{r.item_id}</div>
                  <div>Période: {r.start_date} → {r.end_date}</div>
                  <div>Prix/jour: {r.daily_price} • Total: {r.total_credits} • Dépôt: {r.deposit_credits}</div>
                  <div>Statut: <span className="font-medium">{r.status}</span></div>
                </div>
                <div className="flex gap-2">
                  {r.status === 'requested' && (
                    <>
                      <Button size="sm" onClick={() => setStatus(r.id, 'accepted')}>Accepter</Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus(r.id, 'cancelled')}>Refuser</Button>
                    </>
                  )}
                  {r.status === 'accepted' && (
                    <Button size="sm" onClick={() => setStatus(r.id, 'active')}>Démarrer</Button>
                  )}
                  {r.status === 'active' && (
                    <Button size="sm" onClick={() => setStatus(r.id, 'completed')}>Terminer</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RentalsPage;


