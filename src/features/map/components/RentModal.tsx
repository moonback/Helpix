import React from 'react';
import Button from '@/components/ui/Button';
import { ShoppingBag, X } from 'lucide-react';

export interface RentableItemMarker {
  id: number;
  name: string;
  description: string;
  daily_price: number | null;
  deposit: number;
  available: boolean;
  owner_id: string;
  location: { lat: number; lng: number } | null;
}

export interface RentModalProps {
  isOpen: boolean;
  item: RentableItemMarker | null;
  start: string;
  end: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}

const RentModal: React.FC<RentModalProps> = ({ isOpen, item, start, end, onClose, onConfirm, onStartChange, onEndChange }) => {
  if (!isOpen || !item) return null;
  const totalText = (() => {
    if (!start || !end || !item.daily_price) return '—';
    const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));
    return `${days * item.daily_price} crédits`;
  })();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-[10000]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center"><ShoppingBag size={16} /></div>
            <div>
              <div className="font-semibold text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">{item.daily_price ?? '?'} crédits/jour • Dépôt {item.deposit ?? 0}</div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600" onClick={onClose} aria-label="Fermer le modal">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Début</label>
              <input type="date" value={start} onChange={(e)=>onStartChange(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Fin</label>
              <input type="date" value={end} onChange={(e)=>onEndChange(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="text-sm text-gray-700">Total estimé: {totalText}</div>
        </div>
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={onConfirm}>Confirmer</Button>
        </div>
      </div>
    </div>
  );
};

export default RentModal;
