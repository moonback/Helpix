import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import AddressSearch from '@/components/ui/AddressSearch';
import LocationMap from '@/components/ui/LocationMap';
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  DollarSign, 
  Calendar,
  Tag,
  Trash2
} from 'lucide-react';

const EditTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { tasks, updateTask, deleteTask, isLoading } = useTaskStore();
  const { user } = useAuthStore();
  
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
    tags: ''
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [task, setTask] = useState<any>(null);

  // Charger la tâche existante
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const foundTask = tasks.find(t => t.id === parseInt(taskId));
      if (foundTask) {
        setTask(foundTask);
        
        // Vérifier que l'utilisateur est le propriétaire
        if (user && foundTask.user_id !== user.id) {
          navigate('/');
          return;
        }

        // Pré-remplir le formulaire
        setFormData({
          title: foundTask.title || '',
          description: foundTask.description || '',
          category: foundTask.category || 'local',
          priority: foundTask.priority || 'medium',
          estimated_duration: foundTask.estimated_duration?.toString() || '',
          location: foundTask.location || '',
          required_skills: foundTask.required_skills?.join(', ') || '',
          budget_credits: foundTask.budget_credits?.toString() || '',
          deadline: foundTask.deadline ? new Date(foundTask.deadline).toISOString().slice(0, 16) : '',
          tags: foundTask.tags?.join(', ') || ''
        });

        // Définir la localisation si elle existe
        if (foundTask.latitude && foundTask.longitude) {
          setSelectedLocation({
            latitude: foundTask.latitude,
            longitude: foundTask.longitude
          });
        }
      }
    }
  }, [taskId, tasks, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !task) return;

    setIsSubmitting(true);
    try {
      const updatedTaskData = {
        ...task,
        ...formData,
        estimated_duration: parseInt(formData.estimated_duration),
        budget_credits: parseInt(formData.budget_credits),
        required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        deadline: formData.deadline || undefined,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        updated_at: new Date().toISOString()
      };

      await updateTask(task.id, updatedTaskData);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la modification de la tâche:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    } finally {
      setIsDeleting(false);
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

  if (isLoading || !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la tâche...</p>
        </div>
      </div>
    );
  }

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
            Modifier la Tâche
          </h1>
          <div className="w-10" />
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

          {/* Aperçu de la priorité */}
          <Card>
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
          </Card>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="flex-1"
              disabled={
                !formData.title || 
                !formData.description || 
                !formData.estimated_duration || 
                !formData.budget_credits ||
                (formData.category === 'local' && !selectedLocation)
              }
            >
              {isSubmitting ? 'Modification...' : '💾 Sauvegarder'}
            </Button>

            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={handleDelete}
              loading={isDeleting}
              className="px-6"
            >
              {isDeleting ? 'Suppression...' : <Trash2 className="w-5 h-5" />}
            </Button>
          </div>

          {/* Message d'aide pour la localisation */}
          {formData.category === 'local' && !selectedLocation && (
            <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              📍 Pour les tâches sur place, une localisation précise est requise
            </div>
          )}
        </motion.form>
      </div>
    </div>
  );
};

export default EditTaskPage;
