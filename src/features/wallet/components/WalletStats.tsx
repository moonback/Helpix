import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Activity,
  Target,
  Calendar
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { WalletStats as WalletStatsType } from '../types/wallet';

interface WalletStatsProps {
  stats: WalletStatsType | null;
}

const WalletStats: React.FC<WalletStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Gains mensuels',
      value: stats.monthly_earnings,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      suffix: ' crédits'
    },
    {
      title: 'Gains en attente',
      value: stats.pending_earnings,
      icon: Clock,
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      suffix: ' crédits'
    },
    {
      title: 'Total transactions',
      value: stats.total_transactions,
      icon: Activity,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      suffix: ''
    },
    {
      title: 'Moyenne par tâche',
      value: stats.average_earning_per_task,
      icon: Target,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      suffix: ' crédits'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group"
            >
              <Card className={`p-6 bg-gradient-to-br ${metric.color} text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-white/90 text-sm font-medium mb-1">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {metric.value.toLocaleString()}{metric.suffix}
                    </p>
                  </div>
                  
                  <motion.div 
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Graphique de progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Progression des gains</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Objectif mensuel</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.monthly_earnings} / 1000 crédits
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.monthly_earnings / 1000) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>0</span>
              <span className="font-medium">
                {Math.round((stats.monthly_earnings / 1000) * 100)}% complété
              </span>
              <span>1000</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Activité récente */}
      {stats.recent_activity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>Activité récente</span>
            </h3>
            
            <div className="space-y-3">
              {stats.recent_activity.slice(0, 5).map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
                    </p>
                    <p className="text-xs text-gray-600">
                      {transaction.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default WalletStats;
