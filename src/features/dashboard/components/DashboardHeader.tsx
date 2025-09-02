import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

interface DashboardHeaderProps {
  onCreateTask: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onCreateTask }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-white to-blue-50 shadow-sm border-b border-gray-200"
    >
      <div className="flex items-center justify-between p-6 max-w-12xl mx-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 transition-colors duration-200"
          >
            <BarChart3 className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 mt-1">Gérez vos tâches et suivez vos progrès</p>
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onCreateTask}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle Tâche
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardHeader;
