import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Clock, DollarSign, MessageSquare, MapPin } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { Task } from '@/types';
import { useHelpOfferStore } from '@/stores/helpOfferStore';

interface HelpOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onSuccess?: () => void;
}

const HelpOfferModal: React.FC<HelpOfferModalProps> = ({
  isOpen,
  onClose,
  task,
  onSuccess
}) => {
  const { createHelpOffer, isLoading, error, clearError } = useHelpOfferStore();
  const [message, setMessage] = useState('');
  const [proposedDuration, setProposedDuration] = useState<number>(task.estimated_duration);
  const [proposedCredits, setProposedCredits] = useState<number>(task.budget_credits);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createHelpOffer(
        task.id,
        message.trim() || undefined,
        proposedDuration || undefined,
        proposedCredits || undefined
      );
      
      // Réinitialiser le formulaire
      setMessage('');
      setProposedDuration(task.estimated_duration);
      setProposedCredits(task.budget_credits);
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de l\'offre:', error);
    }
  };

  const handleClose = () => {
    clearError();
    setMessage('');
    setProposedDuration(task.estimated_duration);
    setProposedCredits(task.budget_credits);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Offrir mon aide</h2>
                    <p className="text-emerald-100 text-sm">Proposez votre aide pour cette tâche</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Task Info */}
            <div className="p-6 border-b border-slate-200">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4">
                <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  {task.title}
                </h3>
                <p className="text-slate-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{task.estimated_duration}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{task.budget_credits} crédits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{task.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Message personnalisé */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Message personnalisé (optionnel)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez pourquoi vous êtes la bonne personne pour cette tâche, votre expérience, votre disponibilité..."
                  className="w-full p-4 border border-slate-200 rounded-2xl focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-right text-xs text-slate-400 mt-1">
                  {message.length}/500 caractères
                </div>
              </div>

              {/* Propositions alternatives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Durée proposée (heures)
                  </label>
                  <Input
                    type="number"
                    value={proposedDuration}
                    onChange={(e) => setProposedDuration(Number(e.target.value))}
                    placeholder="Durée estimée"
                    min="1"
                    max="100"
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Durée originale: {task.estimated_duration}h
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Crédits proposés
                  </label>
                  <Input
                    type="number"
                    value={proposedCredits}
                    onChange={(e) => setProposedCredits(Number(e.target.value))}
                    placeholder="Crédits souhaités"
                    min="0"
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Budget original: {task.budget_credits} crédits
                  </p>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-slate-300 hover:border-slate-400 hover:bg-slate-50 py-3 rounded-2xl"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Envoi...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      <span>Envoyer l'offre</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HelpOfferModal;
