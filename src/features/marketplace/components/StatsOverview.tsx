import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Users, 
  Star, 
  TrendingUp,

} from 'lucide-react';
import Card from '@/components/ui/Card';

interface StatsOverviewProps {
  stats: {
    totalItems: number;
    availableItems: number;
    totalRentals: number;
    averageRating: number;
    categories: Record<string, number>;
  };
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      icon: Package,
      label: 'Objets disponibles',
      value: stats.availableItems,
      total: stats.totalItems,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      textColor: 'text-emerald-600'
    },
    {
      icon: Users,
      label: 'Locations totales',
      value: stats.totalRentals,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-600'
    },
    {
      icon: Star,
      label: 'Note moyenne',
      value: stats.averageRating.toFixed(1),
      suffix: '/5',
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'from-yellow-50 to-orange-50',
      textColor: 'text-yellow-600'
    },
    {
      icon: TrendingUp,
      label: 'Catégories actives',
      value: Object.values(stats.categories).filter(count => count > 0).length,
      total: Object.keys(stats.categories).length,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
        >
          <Card className={`p-6 bg-gradient-to-br ${stat.bgColor} border-0`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </span>
                  {stat.suffix && (
                    <span className="text-sm text-slate-500">
                      {stat.suffix}
                    </span>
                  )}
                  {stat.total && (
                    <span className="text-sm text-slate-500">
                      / {stat.total}
                    </span>
                  )}
                </div>
              </div>
              
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            {/* Barre de progression pour les stats avec total */}
            {stat.total && (
              <div className="mt-4">
                <div className="w-full bg-white/50 rounded-full h-2">
                  <div 
                    className={`h-2 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                    style={{ 
                      width: `${Math.min(100, (Number(stat.value) / stat.total) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;
