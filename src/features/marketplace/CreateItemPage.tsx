import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Upload, 
  MapPin, 
  DollarSign, 

  Tag,
  Camera,
  X
} from 'lucide-react';
import { useMarketplaceStore } from '@/stores/marketplaceStore';
import { useAuthStore } from '@/stores/authStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { ItemCategory, ItemCondition } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

const CreateItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId?: string }>();
  const isEditing = !!itemId;

  // Stores
  const { 
    createItem, 
    updateItem, 
    fetchItemById
  } = useMarketplaceStore();
  const { user } = useAuthStore();
  const { latitude, longitude } = useGeolocation();

  // State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as ItemCategory | '',
    condition: '' as ItemCondition | '',
    daily_price: '',
    deposit: '',
    tags: [] as string[],
    images: [] as string[],
    location: '',
    latitude: latitude || 0,
    longitude: longitude || 0,
  });

  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: { value: ItemCategory; label: string; icon: string }[] = [
    { value: 'tools', label: 'Outils', icon: '🔧' },
    { value: 'vehicles', label: 'Véhicules', icon: '🚗' },
    { value: 'sports', label: 'Sport', icon: '⚽' },
    { value: 'electronics', label: 'Électronique', icon: '📱' },
    { value: 'home', label: 'Maison', icon: '🏠' },
    { value: 'garden', label: 'Jardin', icon: '🌱' },
    { value: 'books', label: 'Livres', icon: '📚' },
    { value: 'clothing', label: 'Vêtements', icon: '👕' },
    { value: 'musical', label: 'Musique', icon: '🎵' },
    { value: 'photography', label: 'Photo', icon: '📸' },
    { value: 'outdoor', label: 'Plein air', icon: '🏔️' },
    { value: 'other', label: 'Autres', icon: '📦' },
  ];

  const conditions: { value: ItemCondition; label: string; description: string }[] = [
    { value: 'excellent', label: 'Excellent', description: 'Comme neuf' },
    { value: 'good', label: 'Bon', description: 'Très bon état' },
    { value: 'fair', label: 'Correct', description: 'État correct' },
    { value: 'poor', label: 'Usé', description: 'Fonctionnel mais usé' },
  ];

  // Charger l'objet à éditer
  useEffect(() => {
    if (isEditing && itemId) {
      const loadItem = async () => {
        const item = await fetchItemById(parseInt(itemId));
        if (item) {
          setFormData({
            name: item.name,
            description: item.description || '',
            category: item.category,
            condition: item.condition,
            daily_price: item.daily_price?.toString() || '',
            deposit: item.deposit?.toString() || '',
            tags: item.tags || [],
            images: item.images || [],
            location: item.location || '',
            latitude: item.latitude || latitude || 0,
            longitude: item.longitude || longitude || 0,
          });
        }
      };
      loadItem();
    }
  }, [isEditing, itemId, fetchItemById, latitude, longitude]);

  // Mettre à jour la localisation
  useEffect(() => {
    if (latitude && longitude) {
      setFormData(prev => ({
        ...prev,
        latitude,
        longitude
      }));
    }
  }, [latitude, longitude]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // TODO: Implémenter l'upload d'images vers Supabase Storage
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        category: formData.category as ItemCategory,
        condition: formData.condition as ItemCondition,
        daily_price: parseInt(formData.daily_price) || 0,
        deposit: parseInt(formData.deposit) || 0,
        tags: formData.tags,
        images: formData.images,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        is_rentable: true,
        available: true,
      };

      if (isEditing && itemId) {
        await updateItem(parseInt(itemId), itemData);
      } else {
        await createItem(itemData);
      }

      navigate('/marketplace');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.category && formData.condition && formData.daily_price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/marketplace')}
              className="text-slate-600 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  {isEditing ? 'Modifier l\'objet' : 'Proposer un objet'}
                </h1>
                <p className="text-sm text-slate-600">
                  {isEditing ? 'Modifiez les informations de votre objet' : 'Partagez un objet avec la communauté'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Informations de base */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Informations de base</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom de l'objet *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Perceuse Bosch, Vélo électrique, Raquette de tennis..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre objet, ses caractéristiques, son état..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    État de l'objet *
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Sélectionner l'état</option>
                    {conditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.label} - {condition.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Tarification */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Tarification
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prix par jour (crédits) *
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.daily_price}
                  onChange={(e) => handleInputChange('daily_price', e.target.value)}
                  placeholder="Ex: 10"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Prix en crédits par jour de location
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Caution (crédits)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.deposit}
                  onChange={(e) => handleInputChange('deposit', e.target.value)}
                  placeholder="Ex: 50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Caution en crédits (optionnel)
                </p>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Photos
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Ajouter des photos
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
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
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              Tags
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Ajouter un tag..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Ajouter
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-emerald-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Localisation */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Localisation
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse ou ville
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ex: Paris, 15 rue de la Paix..."
                />
              </div>

              {latitude && longitude && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-700">
                    📍 Localisation détectée: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
            >
              {isSubmitting ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Publier l\'objet')}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateItemPage;
