import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  DollarSign, 
  MapPin,
  AlertCircle,
  Bell
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import HelpOffersList from '@/components/ui/HelpOffersList';
import { useHelpOfferStore } from '@/stores/helpOfferStore';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';

const HelpOffersPage: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { user } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { 
    offers, 
    fetchOffersForTask, 
    isLoading, 
    error,
    getOffersByStatus 
  } = useHelpOfferStore();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const task = tasks.find(t => t.id === parseInt(taskId || '0'));

  useEffect(() => {
    if (taskId) {
      fetchOffersForTask(parseInt(taskId));
    }
  }, [taskId]);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Vérifier que l'utilisateur est le propriétaire de la tâche
  if (!user || !task || task.user_id !== user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès non autorisé</h2>
          <p className="text-slate-600 mb-6">
            Vous n'êtes pas autorisé à voir les offres d'aide pour cette tâche.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Retour à l'accueil
          </Button>
        </Card>
      </div>
    );
  }

  const filteredOffers = activeTab === 'all' ? offers : getOffersByStatus(activeTab);
  const pendingOffers = getOffersByStatus('pending');
  const acceptedOffers = getOffersByStatus('accepted');
  const rejectedOffers = getOffersByStatus('rejected');

  const tabs = [
    { id: 'all', label: 'Toutes', count: offers.length },
    { id: 'pending', label: 'En attente', count: pendingOffers.length },
    { id: 'accepted', label: 'Acceptées', count: acceptedOffers.length },
    { id: 'rejected', label: 'Refusées', count: rejectedOffers.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800">Offres d'aide</h1>
              <p className="text-slate-600">{task.title}</p>
            </div>

            {pendingOffers.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-2 rounded-xl">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {pendingOffers.length} offre{pendingOffers.length > 1 ? 's' : ''} en attente
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Informations de la tâche */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
                    <p className="text-slate-600">Statut: {task.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-slate-700 mb-4">{task.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-emerald-800">Durée estimée</div>
                        <div className="text-emerald-700 font-medium">{task.estimated_duration}h</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-purple-800">Budget</div>
                        <div className="text-purple-700 font-medium">{task.budget_credits} crédits</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-orange-800">Localisation</div>
                        <div className="text-orange-700 font-medium truncate">{task.location}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          activeTab === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Liste des offres */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Chargement des offres...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={() => fetchOffersForTask(parseInt(taskId || '0'))}>
                      Réessayer
                    </Button>
                  </div>
                ) : (
                  <HelpOffersList
                    offers={filteredOffers}
                    taskId={parseInt(taskId || '0')}
                    onOfferUpdate={() => fetchOffersForTask(parseInt(taskId || '0'))}
                  />
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HelpOffersPage;
