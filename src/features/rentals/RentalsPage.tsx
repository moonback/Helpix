import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, Package, User, MapPin, CheckCircle, XCircle, Play } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { RentalStatus } from '@/types';

// Utilisation du type Rental importé de @/types

const RentalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { rentals, isLoading, fetchRentals, updateRentalStatus, cancelRental } = useMarketplaceStore();
  const [filter, setFilter] = useState<'all' | 'requested' | 'accepted' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user?.id) {
      fetchRentals(user.id);
    }
  }, [user?.id, fetchRentals]);

  const setStatus = async (id: string, status: RentalStatus) => {
    try {
      await updateRentalStatus(id, status);
      // Le store se met à jour automatiquement
    } catch (e: any) {
      console.error('Erreur lors de la mise à jour du statut:', e);
      
      // Afficher un message d'erreur plus clair à l'utilisateur
      if (e.message?.includes('Solde insuffisant')) {
        alert('❌ Impossible d\'accepter cette demande : le locataire n\'a pas suffisamment de crédits pour effectuer cette location.');
      } else {
        alert(`❌ Erreur lors de la mise à jour du statut : ${e.message || 'Erreur inconnue'}`);
      }
    }
  };

  const handleCancel = async (id: string, reason?: string) => {
    try {
      await cancelRental(id, reason);
      // Le store se met à jour automatiquement
    } catch (e) {
      console.error('Erreur lors de l\'annulation:', e);
    }
  };

  const getStatusColor = (status: RentalStatus) => {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: RentalStatus) => {
    switch (status) {
      case 'requested': return <Clock className="w-3 h-3" />;
      case 'accepted': return <CheckCircle className="w-3 h-3" />;
      case 'active': return <Play className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusLabel = (status: RentalStatus) => {
    switch (status) {
      case 'requested': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'active': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const filteredRentals = rentals.filter(rental => 
    filter === 'all' || rental.status === filter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="px-6 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Mes Locations</h1>
          </div>
          <p className="text-sm text-slate-600">Gérez vos locations d'objets</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Toutes', count: rentals.length },
                { key: 'requested', label: 'En attente', count: rentals.filter(r => r.status === 'requested').length },
                { key: 'accepted', label: 'Acceptées', count: rentals.filter(r => r.status === 'accepted').length },
                { key: 'active', label: 'En cours', count: rentals.filter(r => r.status === 'active').length },
                { key: 'completed', label: 'Terminées', count: rentals.filter(r => r.status === 'completed').length },
                { key: 'cancelled', label: 'Annulées', count: rentals.filter(r => r.status === 'cancelled').length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    filter === key
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-600">Chargement des locations...</span>
                </div>
              </div>
            ) : filteredRentals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {filter === 'all' ? 'Aucune location' : `Aucune location ${getStatusLabel(filter as any).toLowerCase()}`}
                </h3>
                <p className="text-sm text-slate-500">
                  {filter === 'all' 
                    ? 'Vous n\'avez pas encore de locations d\'objets.' 
                    : `Aucune location avec le statut "${getStatusLabel(filter as any).toLowerCase()}".`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRentals.map((rental, index) => (
                  <motion.div
                    key={rental.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">
                              {rental.item?.name || `Objet #${rental.item_id}`}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(rental.status)}`}>
                                {getStatusIcon(rental.status)}
                                {getStatusLabel(rental.status)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-xs text-slate-500">Période de location</p>
                                <p className="text-sm font-medium text-slate-800">
                                  {formatDate(rental.start_date)} → {formatDate(rental.end_date)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-xs text-slate-500">Prix par jour</p>
                                <p className="text-sm font-medium text-slate-800">{rental.daily_price} crédits</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="text-sm font-medium text-slate-800">{rental.total_credits} crédits</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-xs text-slate-500">Dépôt</p>
                                <p className="text-sm font-medium text-slate-800">{rental.deposit_credits} crédits</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Informations sur les participants */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                                {rental.owner?.avatar_url ? (
                                  <img 
                                    src={rental.owner.avatar_url} 
                                    alt={rental.owner.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Propriétaire</p>
                                <p className="text-sm font-medium text-slate-800">
                                  {rental.owner?.name || 'Propriétaire'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center overflow-hidden">
                                {rental.renter?.avatar_url ? (
                                  <img 
                                    src={rental.renter.avatar_url} 
                                    alt={rental.renter.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-green-600" />
                                )}
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Locataire</p>
                                <p className="text-sm font-medium text-slate-800">
                                  {rental.renter?.name || 'Locataire'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {rental.item?.description && (
                          <div className="mb-4">
                            <p className="text-xs text-slate-500 mb-1">Description</p>
                            <p className="text-sm text-slate-700">{rental.item.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        {/* Actions pour le propriétaire */}
                        {user?.id === rental.owner_id && (
                          <>
                            {rental.status === 'requested' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => setStatus(rental.id, 'accepted')}
                                  className="text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accepter
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleCancel(rental.id, 'Demande refusée par le propriétaire')}
                                  className="text-xs"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Refuser
                                </Button>
                              </>
                            )}
                            {rental.status === 'accepted' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => setStatus(rental.id, 'active')}
                                  className="text-xs"
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Démarrer
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleCancel(rental.id, 'Location annulée')}
                                  className="text-xs"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Annuler
                                </Button>
                              </>
                            )}
                            {rental.status === 'active' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => setStatus(rental.id, 'completed')}
                                  className="text-xs"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Terminer
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => handleCancel(rental.id, 'Location annulée en cours')}
                                  className="text-xs"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Annuler
                                </Button>
                              </>
                            )}
                          </>
                        )}

                        {/* Actions pour le locataire */}
                        {user?.id === rental.renter_id && (
                          <>
                            {(rental.status === 'accepted' || rental.status === 'active') && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleCancel(rental.id, 'Annulation par le locataire')}
                                className="text-xs"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Annuler ma demande
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RentalsPage;


