import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import { MatchingNotificationBadge } from '@/features/matching';
import Button from '@/components/ui/Button';
import DetailedAddressDisplay from '@/components/ui/DetailedAddressDisplay';
import { 
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
      <div className="max-w-12xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Logo avec effet de survol amélioré */}
            <motion.div 
              className="relative group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl group-hover:shadow-2xl transition-all duration-300">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src="/assets/logo.png" 
                    alt="Helpix Logo" 
                    className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
            </motion.div>

            {/* Texte du logo avec animations améliorées */}
            <div className="flex flex-col">
              <motion.h1 
                className="text-lg font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent cursor-pointer hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/')}
              >
                Helpix
              </motion.h1>
              <motion.p 
                className="text-xs text-slate-500 font-medium leading-tight"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                L'entraide près de chez vous !
              </motion.p>
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
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md text-xs border border-slate-200">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span>Position...</span>
                </div>
              ) : latitude && longitude ? (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 text-xs">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <DetailedAddressDisplay
                    address={address}
                    isLoading={isLoading}
                    error={error}
                    showIcon={false}
                    className="text-emerald-700 font-medium truncate max-w-[100px] lg:max-w-[140px]"
                    onRetry={retry}
                  />
                </div>
              ) : locationError ? (
                <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>Erreur</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg text-sm border border-slate-200">
                  <Navigation className="w-4 h-4" />
                  <span>Non localisé</span>
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
                Créer
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

        {/* Mobile & Tablet Layout */}
        <div className="md:hidden">
          {/* Top Row: Logo and Actions */}
          <motion.div 
            className="flex items-center justify-between mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Mobile Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                <img 
                  src="/assets/logo.png" 
                  alt="Helpix Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                  Helpix
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden xs:block">
                  Bonjour {user?.email?.split('@')[0] || 'Utilisateur'} !
                </p>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <Button
                onClick={() => navigate('/create-task')}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md px-2 sm:px-3"
              >
                <Plus className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline text-sm">Créer</span>
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
                className="border-slate-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 p-2"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Bottom Row: Location Status */}
          <motion.div 
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {locationLoading ? (
              <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg text-xs sm:text-sm border border-slate-200 w-full max-w-sm justify-center">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                <span>Localisation en cours...</span>
              </div>
            ) : latitude && longitude ? (
              <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 text-xs sm:text-sm shadow-sm w-full max-w-sm justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
                <DetailedAddressDisplay
                  address={address}
                  isLoading={isLoading}
                  error={error}
                  showIcon={false}
                  className="text-emerald-700 font-medium truncate flex-1 text-center"
                  onRetry={retry}
                />
              </div>
            ) : locationError ? (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 text-[10px] sm:text-xs w-full max-w-sm justify-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Erreur de localisation</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-lg text-[10px] sm:text-xs border border-slate-200 w-full max-w-sm justify-center">
                <Navigation className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Aucune localisation</span>
              </div>
            )}
          </motion.div>

          {/* User greeting for very small screens */}
          <div className="xs:hidden mt-2 text-center">
            <p className="text-[10px] text-slate-500">
              Bonjour {user?.email?.split('@')[0] || 'Utilisateur'} !
            </p>
          </div>
        </div>
      </div>
      
      {/* Badge de notification de matching */}
      {user && (
        <MatchingNotificationBadge 
          showDetails={true}
          position="top-right"
        />
      )}
    </motion.header>
  );
};

export default HomeHeader;