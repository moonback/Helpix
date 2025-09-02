import React, { memo, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Button from '@/components/ui/Button';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

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

export interface ItemMarkerProps {
  item: RentableItemMarker;
  userLocation: { lat: number; lng: number } | null;
  onOpenModal: (item: RentableItemMarker) => void;
}

const ItemMarker: React.FC<ItemMarkerProps> = ({ item, userLocation, onOpenModal }) => {
  const icon = useMemo(() => L.divIcon({
    className: 'custom-item-marker',
    html: `<div style="transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#2563eb;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2);font-size:14px">🛍️</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }), []);

  if (!item.location) return null;
  return (
    <Marker position={[item.location.lat, item.location.lng]} icon={icon}>
      <Popup className="min-w-[280px]">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center"><ShoppingBag size={16} /></div>
            <div>
              <div className="font-semibold text-gray-900">{item.name}</div>
              <div className="text-xs text-gray-500">Objet louable</div>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-2">{item.description}</p>
          <div className="text-sm text-gray-800 mb-2">{item.daily_price ?? '?'} crédits/jour • Dépôt {item.deposit ?? 0}</div>
          {userLocation && item.location && (
            <div className="text-xs text-primary-600 font-medium mb-2">
              {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, item.location.lat, item.location.lng))}
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => onOpenModal(item)}>Demander la location</Button>
            <a className="text-xs px-2 py-1 border rounded-md hover:bg-gray-50" href={`https://www.google.com/maps/dir/?api=1&destination=${item.location.lat},${item.location.lng}`} target="_blank" rel="noopener noreferrer">Itinéraire</a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default memo(ItemMarker);
