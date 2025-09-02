import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  Star, 
  Zap
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

const StatsOverviewNew: React.FC<StatsOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      icon: Package,
      label: 'Objets total',
      value: stats.totalItems,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      icon: Zap,
      label: 'Disponibles',
      value: stats.availableItems,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      icon: TrendingUp,
      label: 'Locations',
      value: stats.totalRentals,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      change: '+24%',
      changeType: 'positive' as const
    },
    {
      icon: Star,
      label: 'Note moyenne',
      value: stats.averageRating.toFixed(1),
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100',
      change: '+0.3',
      changeType: 'positive' as const
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {statCards.map((stat, index) => (
        <motion.div key={stat.label} variants={cardVariants}>
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'positive' 
                  ? 'bg-emerald-100 text-emerald-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-slate-800">
                {stat.value}
              </h3>
              <p className="text-sm text-slate-600">
                {stat.label}
              </p>
            </div>

            {/* Barre de progression décorative */}
            <div className="mt-4 h-1 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stat.value as number) / 100 * 100, 100)}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
              />
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsOverviewNew;
