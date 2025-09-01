import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, TrendingUp } from 'lucide-react';
import { VIEW_TABS } from '../constants';

interface ViewTabsProps {
  selectedView: 'overview' | 'tasks' | 'analytics';
  onViewChange: (view: 'overview' | 'tasks' | 'analytics') => void;
}

const iconMap = {
  BarChart3,
  FileText,
  TrendingUp
};

const ViewTabs: React.FC<ViewTabsProps> = ({ selectedView, onViewChange }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
      <div className="flex space-x-1">
        {VIEW_TABS.map((tab) => {
          const Icon = iconMap[tab.icon as keyof typeof iconMap];
          const isActive = selectedView === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onViewChange(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ViewTabs;
