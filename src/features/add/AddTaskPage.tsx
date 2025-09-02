import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import AddressSearch from '@/components/ui/AddressSearch';
import LocationMap from '@/components/ui/LocationMap';
import CreditCheckModal from '@/components/ui/CreditCheckModal';
import CreditsDisplayWithPurchase from '@/components/ui/CreditsDisplayWithPurchase';
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  DollarSign, 
  Calendar,
  Tag,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Upload,
  X
} from 'lucide-react';

const AddTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { createTask } = useTaskStore();
  const { user } = useAuthStore();
  const { wallet, createTransaction } = useWalletStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'local' as 'local' | 'remote',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimated_duration: '',
    location: '',
    required_skills: '',
    budget_credits: '',
    deadline: '',
    tags: '',
    images: [] as string[],
    imageFiles: [] as File[]
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreditCheckOpen, setIsCreditCheckOpen] = useState(false);

  // Gestion des images
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...newFiles]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  // Calculer le coût de la tâche (minimum 10 crédits)
  const taskCost = Math.max(10, parseInt(formData.budget_credits) || 0);
  const hasEnoughCredits = (wallet?.balance || 0) >= taskCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Vérifier les crédits avant de créer la tâche
    if (!hasEnoughCredits) {
      setIsCreditCheckOpen(true);
      return;
    }

    await createTaskWithCredits();
  };

  const createTaskWithCredits = async () => {
    if (!user || !wallet) return;

    setIsSubmitting(true);
    try {
      const taskData = {
        ...formData,
        user_id: user.id,
        status: 'open' as 'open' | 'in_progress' | 'completed' | 'cancelled',
        estimated_duration: parseInt(formData.estimated_duration),
        budget_credits: parseInt(formData.budget_credits),
        required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        deadline: formData.deadline || undefined,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        images: formData.imageFiles.map(file => URL.createObjectURL(file)), // URLs temporaires pour l'instant
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Créer la tâche
      await createTask(taskData);

      // Débiter les crédits
      await createTransaction({
        wallet_id: wallet.id,
        type: 'debit',
        amount: taskCost,
        description: `Création de la tâche: ${formData.title}`,
        reference_type: 'task_completion',
        reference_id: 'pending', // Sera mis à jour après création
        status: 'completed',
        metadata: {
          task_title: formData.title
        }
      });

      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            Nouvelle Tâche
          </h1>
          <CreditsDisplayWithPurchase 
            requiredCredits={taskCost}
            className="flex-shrink-0"
          />
        </div>
        

      </div>

      <div className="p-4 space-y-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Informations de base */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📝 Informations de base
              </h2>
              
              <Input
                label="Titre de la tâche"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Aide pour déménagement"
                required
              />

              <Input
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez en détail ce dont vous avez besoin..."
                required
                multiline
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'local' | 'remote' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="local">📍 Sur place</option>
                    <option value="remote">💻 À distance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="low">🟢 Faible</option>
                    <option value="medium">🟡 Moyenne</option>
                    <option value="high">🟠 Élevée</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Détails et localisation */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📍 Détails et localisation
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Durée estimée (heures)"
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                  placeholder="2"
                  required
                  leftIcon={Clock}
                />

                <Input
                  label="Budget (crédits)"
                  type="number"
                  value={formData.budget_credits}
                  onChange={(e) => setFormData({ ...formData, budget_credits: e.target.value })}
                  placeholder="50"
                  required
                  leftIcon={DollarSign}
                />
              </div>

              <AddressSearch
                label="Localisation"
                value={formData.location}
                onChange={(address) => setFormData({ ...formData, location: address })}
                onLocationSelect={(lat, lng) => setSelectedLocation({ latitude: lat, longitude: lng })}
                placeholder="Rechercher une adresse ou utiliser votre localisation actuelle"
                required
              />

              {/* Carte de localisation */}
              {selectedLocation && (
                <LocationMap
                  latitude={selectedLocation.latitude}
                  longitude={selectedLocation.longitude}
                  address={formData.location}
                  className="mt-4"
                />
              )}

              <Input
                label="Compétences requises"
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                placeholder="Ex: Bricolage, Informatique, Langues (séparées par des virgules)"
                leftIcon={Target}
              />

              <Input
                label="Tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Ex: urgent, déménagement, aide (séparés par des virgules)"
                leftIcon={Tag}
              />

              <Input
                label="Date limite (optionnel)"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                leftIcon={Calendar}
              />
            </div>
          </Card>

          {/* Images */}
          <Card>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📸 Images (optionnel)
              </h2>
              <p className="text-sm text-gray-600">
                Ajoutez des photos pour mieux illustrer votre tâche
              </p>

              <div className="space-y-4">
                <div>
                  <input
                    type="file"
                    id="task-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="task-image-upload"
                    className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 text-slate-500" />
                    <span className="text-slate-600">Ajouter des photos</span>
                  </label>
                </div>

                {formData.imageFiles && formData.imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.imageFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Aperçu de la priorité et coût */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${priorityColors[formData.priority]}`}>
                  <span className="text-lg">{priorityIcons[formData.priority]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    Priorité {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.priority === 'urgent' && 'Besoin immédiat'}
                    {formData.priority === 'high' && 'Besoin important'}
                    {formData.priority === 'medium' && 'Besoin modéré'}
                    {formData.priority === 'low' && 'Pas urgent'}
                  </p>
                </div>
              </div>

              {/* Coût de la tâche */}
              <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                hasEnoughCredits 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`p-2 rounded-full ${
                  hasEnoughCredits 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {hasEnoughCredits ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    Coût de création: {taskCost} crédits
                  </p>
                  <p className={`text-sm ${
                    hasEnoughCredits ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {hasEnoughCredits 
                      ? `Solde suffisant (${wallet?.balance || 0} crédits)`
                      : `Crédits insuffisants (${wallet?.balance || 0}/${taskCost})`
                    }
                  </p>
                </div>
                {!hasEnoughCredits && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreditCheckOpen(true)}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Recharger
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Bouton de soumission */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full"
            disabled={
              !formData.title || 
              !formData.description || 
              !formData.estimated_duration || 
              !formData.budget_credits ||
              (formData.category === 'local' && !selectedLocation) ||
              !hasEnoughCredits
            }
          >
            {isSubmitting ? 'Création...' : 'Créer la tâche'}
          </Button>

          {/* Messages d'aide */}
          {formData.category === 'local' && !selectedLocation && (
            <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              📍 Pour les tâches sur place, une localisation précise est requise
            </div>
          )}
          
          {!hasEnoughCredits && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              💳 Crédits insuffisants pour créer cette tâche. Rechargez votre compte.
            </div>
          )}
        </motion.form>
      </div>

      {/* Modal de vérification des crédits */}
      <CreditCheckModal
        isOpen={isCreditCheckOpen}
        onClose={() => setIsCreditCheckOpen(false)}
        requiredCredits={taskCost}
        taskTitle={formData.title || 'Nouvelle tâche'}
        onCreditsSufficient={createTaskWithCredits}
      />
    </div>
  );
};

export default AddTaskPage;
