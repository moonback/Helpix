import React, { memo, useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Button from '@/components/ui/Button';
import { calculateDistance, formatDistance } from '@/lib/utils';
import { MapTask } from '../MapPage';

export interface TaskMarkerProps {
  task: MapTask;
  userLocation: { lat: number; lng: number } | null;
  onTaskClick: (task: MapTask) => void;
  onOfferHelp: (taskId: number) => void;
}

const TaskMarker: React.FC<TaskMarkerProps> = ({ task, userLocation, onTaskClick, onOfferHelp }) => {
  const icon = useMemo(() => L.divIcon({
    className: 'custom-task-marker',
    html: `<div style="transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:#10b981;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.2);font-size:14px">📌</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  }), []);

  return (
    <Marker position={[task.location.lat, task.location.lng]} icon={icon}>
      <Popup className="min-w-[280px]">
        <div className="p-3">
          <div className="mb-3">
            <h3 className="font-semibold text-base text-gray-900 mb-1">{task.title}</h3>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                task.category === 'local' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {task.category === 'local' ? '📍 Sur place' : '💻 À distance'}
              </span>
              <span className="text-xs text-gray-500">{new Date(task.created_at).toLocaleDateString('fr-FR')}</span>
              {userLocation && (
                <span className="text-xs text-primary-600 font-medium">
                  {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, task.location.lat, task.location.lng))}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{task.description}</p>
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Priorité:</span>
              <span className={`px-2 py-1 rounded-full font-medium ${
                task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {task.priority === 'urgent' ? '🔴 Urgente' :
                 task.priority === 'high' ? '🟠 Élevée' :
                 task.priority === 'medium' ? '🟡 Moyenne' : '🟢 Faible'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1"><span>⏱️ {task.estimated_duration}h</span></div>
              <div className="flex items-center gap-1"><span>💰 {task.budget_credits} crédits</span></div>
            </div>
          </div>
          {task.required_skills && task.required_skills.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Compétences requises:</div>
              <div className="flex flex-wrap gap-1">
                {task.required_skills.slice(0, 3).map((skill: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{skill}</span>
                ))}
                {task.required_skills.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{task.required_skills.length - 3}</span>
                )}
              </div>
            </div>
          )}
          {task.tags && task.tags.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Tags:</div>
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 4).map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <Button variant="primary" size="sm" className="flex-1 text-xs" onClick={() => onTaskClick(task)}>Voir détails</Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => onOfferHelp(task.id)}>Aider</Button>
            <a className="text-xs px-2 py-1 border rounded-md hover:bg-gray-50" href={`https://www.google.com/maps/dir/?api=1&destination=${task.location.lat},${task.location.lng}`} target="_blank" rel="noopener noreferrer">Itinéraire</a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default memo(TaskMarker);
