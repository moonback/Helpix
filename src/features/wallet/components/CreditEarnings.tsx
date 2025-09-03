import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 

  User,
  Calendar
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { CreditEarning } from '../types/wallet';

interface CreditEarningsProps {
  earnings: CreditEarning[];
  showHeader?: boolean;
  title?: string;
  onProcessEarning?: (earningId: string) => void;
}

const CreditEarnings: React.FC<CreditEarningsProps> = ({ 
  earnings, 
  showHeader = false, 
  title = "Gains",
  onProcessEarning
}) => {
  const getStatusIcon = (status: CreditEarning['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: CreditEarning['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusLabel = (status: CreditEarning['status']) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  if (earnings.length === 0) {
    return (
      <Card className="p-6">
        {showHeader && (
          <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">Aucun gain</h3>
          <p className="text-sm text-gray-500">
            Vos gains apparaîtront ici une fois que vous aurez aidé d'autres utilisateurs.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {showHeader && (
        <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="space-y-3">
        {earnings.map((earning, index) => (
          <motion.div
            key={earning.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-xs">
                  {earning.task_title}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">
                      Aide apportée
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] text-gray-500">
                      {formatDate(earning.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="font-semibold text-xs text-green-600">
                  +{earning.amount.toLocaleString()} crédits
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getStatusIcon(earning.status)}
                  <span className={`text-[10px] px-2 py-1 rounded-full ${getStatusColor(earning.status)}`}>
                    {getStatusLabel(earning.status)}
                  </span>
                </div>
              </div>

              {earning.status === 'approved' && onProcessEarning && (
                <Button
                  size="sm"
                  onClick={() => onProcessEarning(earning.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Collecter
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {earnings.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium">
            Voir tous les gains
          </button>
        </div>
      )}
    </Card>
  );
};

export default CreditEarnings;
