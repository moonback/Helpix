import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import Button from '@/components/ui/Button';
import DetailedAddressDisplay from '@/components/ui/DetailedAddressDisplay';
import { 
  Heart, 
  Plus, 
  BarChart3, 
  AlertCircle, 
  Navigation 
} from 'lucide-react';

interface HomeHeaderProps {
  className?: string;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { latitude, longitude, error: locationError, isLoading: locationLoading } = useGeolocation();
  const { address, isLoading, error, getAddressFromCoords, retry } = useReverseGeocoding();

  useEffect(() => {
    if (latitude && longitude) {
      getAddressFromCoords(latitude, longitude);
    }
  }, [latitude, longitude, getAddressFromCoords]);

  return (
    <motion.header 
      className={`bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm sticky top-0 z-40 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Entraide Universelle</h1>
              <p className="text-sm text-slate-500">
                Bonjour {user?.email?.split('@')[0] || 'Utilisateur'} !
              </p>
            </div>
          </motion.div>

          {/* Location & Actions Section */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Location Status */}
            <div className="flex items-center">
              {locationLoading ? (
                <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-200">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="hidden sm:inline">Localisation...</span>
                </div>
              ) : latitude && longitude ? (
                <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 text-sm shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                     <DetailedAddressDisplay
                     address={address}
                     isLoading={isLoading}
                     error={error}
                     showIcon={false}
                     className="text-emerald-700 font-medium truncate max-w-[120px] lg:max-w-[180px]"
                     onRetry={retry}
                   />
                </div>
              ) : locationError ? (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Erreur</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-200">
                  <Navigation className="w-4 h-4" />
                  <span className="hidden sm:inline">Non localisé</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => navigate('/create-task')}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Créer</span>
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
                className="border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
};

export default HomeHeader;
