import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle
} from 'lucide-react';
import Card from '@/components/ui/Card';

interface DashboardData {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  performance_metrics: {
    completion_rate: number;
  };
  upcoming_deadlines: any[];
}

interface MetricsCardsProps {
  dashboard: DashboardData;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ dashboard }) => {
  const metrics = [
    {
      title: 'Total des tâches',
      value: dashboard.total_tasks,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Terminées',
      value: dashboard.completed_tasks,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'En cours',
      value: dashboard.in_progress_tasks,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'En retard',
      value: dashboard.overdue_tasks,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    }
  ];

  return (
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
                  <p className="text-3xl font-bold">
                    {metric.value}
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
  );
};

export default MetricsCards;
