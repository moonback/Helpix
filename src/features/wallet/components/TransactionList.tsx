import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { Transaction } from '../types/wallet';

interface TransactionListProps {
  transactions: Transaction[];
  showHeader?: boolean;
  title?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  showHeader = false, 
  title = "Transactions" 
}) => {
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'credit':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'debit':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'withdrawal':
        return <TrendingDown className="w-5 h-5 text-blue-600" />;
      case 'refund':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'credit':
        return 'text-green-600';
      case 'debit':
        return 'text-red-600';
      case 'withdrawal':
        return 'text-blue-600';
      case 'refund':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (transactions.length === 0) {
    return (
      <Card className="p-6">
        {showHeader && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
          <p className="text-gray-500">
            Vos transactions apparaîtront ici une fois que vous commencerez à gagner des crédits.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {showHeader && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'credit' 
                  ? 'bg-green-100' 
                  : transaction.type === 'debit'
                  ? 'bg-red-100'
                  : 'bg-blue-100'
              }`}>
                {getTypeIcon(transaction.type)}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">
                  {transaction.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`text-xs font-medium ${getTypeColor(transaction.type)}`}>
                    {transaction.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(transaction.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className={`font-semibold text-sm ${getTypeColor(transaction.type)}`}>
                  {transaction.type === 'credit' || transaction.type === 'refund' ? '+' : '-'}
                  {transaction.amount.toLocaleString()} crédits
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getStatusIcon(transaction.status)}
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {transactions.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            Voir toutes les transactions
          </button>
        </div>
      )}
    </Card>
  );
};

export default TransactionList;
