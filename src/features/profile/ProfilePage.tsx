import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Plus, MapPin, Star, Settings, LogOut, Camera } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, signOut } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  // Données mockées pour la démonstration
  const skills = [
    { id: 1, name: 'Jardinage', level: 'Expert' },
    { id: 2, name: 'Cuisine', level: 'Intermédiaire' },
    { id: 3, name: 'Informatique', level: 'Avancé' },
    { id: 4, name: 'Bricolage', level: 'Débutant' },
  ];

  const items = [
    { id: 1, name: 'Perceuse', description: 'Perceuse sans fil Bosch', available: true },
    { id: 2, name: 'Livres de cuisine', description: 'Collection de recettes', available: true },
    { id: 3, name: 'Vélo', description: 'Vélo de ville en bon état', available: false },
  ];

  const stats = {
    tasksCompleted: 12,
    tasksCreated: 8,
    rating: 4.8,
    memberSince: '2024',
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
    });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Profile Picture */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-8"
      >
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl text-primary-600 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
              <Camera size={16} className="text-primary-600" />
            </button>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">
            {user?.name || 'Utilisateur'}
          </h1>
          
          {user?.location && (
            <div className="flex items-center justify-center gap-1 text-primary-100">
              <MapPin size={16} />
              <span>{user.location}</span>
            </div>
          )}
        </div>
      </motion.header>

      {/* Stats Cards */}
      <div className="px-6 -mt-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card className="text-center bg-white shadow-lg border-0">
            <div className="p-4">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.tasksCompleted}
              </div>
              <div className="text-sm text-gray-600">Tâches terminées</div>
            </div>
          </Card>
          
          <Card className="text-center bg-white shadow-lg border-0">
            <div className="p-4">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.tasksCreated}
              </div>
              <div className="text-sm text-gray-600">Tâches créées</div>
            </div>
          </Card>
          
          <Card className="text-center bg-white shadow-lg border-0">
            <div className="p-4">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {stats.rating}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                Note
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Profile Info */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Informations personnelles
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                icon={<Edit size={16} />}
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Nom complet"
                  value={editData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                <Input
                  label="Bio"
                  value={editData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Parlez-nous de vous..."
                />
                <Input
                  label="Localisation"
                  value={editData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Votre ville ou quartier"
                />
                
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {user?.bio && (
                  <p className="text-gray-600">{user.bio}</p>
                )}
                <div className="text-sm text-gray-500">
                  Membre depuis {stats.memberSince}
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Skills */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Mes compétences
              </h3>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus size={16} />}
              >
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">{skill.name}</div>
                    <div className="text-sm text-gray-500">{skill.level}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Items */}
      <div className="px-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Objets prêtables
              </h3>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus size={16} />}
              >
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.available 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.available ? 'Disponible' : 'Indisponible'}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Edit size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Settings & Logout */}
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Settings size={20} className="text-gray-500" />
                <span className="text-gray-700">Paramètres</span>
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <LogOut size={20} />
                <span>Se déconnecter</span>
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
