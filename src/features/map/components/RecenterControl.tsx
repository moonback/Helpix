import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';

interface RecenterControlProps {
  onRecenter: () => void;
  userLocation: { lat: number; lng: number } | null;
  className?: string;
}

const RecenterControl: React.FC<RecenterControlProps> = ({
  onRecenter,
  userLocation,
  className = ''
}) => {
  return (
    <motion.div
      className={`fixed bottom-20 right-4 z-30 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <Button
        onClick={onRecenter}
        className="w-12 h-12 rounded-full bg-white shadow-lg border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        title={userLocation ? "Recentrer sur ma position" : "Activer la géolocalisation"}
      >
        {userLocation ? (
          <Navigation className="w-5 h-5 text-blue-600" />
        ) : (
          <MapPin className="w-5 h-5 text-slate-600" />
        )}
      </Button>
    </motion.div>
  );
};

export default RecenterControl;
