import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Plus, MapPin, Star, Settings, LogOut, Camera, Navigation, Award, Activity, Users, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { useReverseGeocoding } from '@/hooks/useReverseGeocoding';
import { useGeolocation } from '@/hooks/useGeolocation';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, signOut, updateUserLocation } = useAuthStore();
  const { address, getAddressFromCoords } = useReverseGeocoding();
  const { latitude, longitude, requestLocation } = useGeolocation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  // Récupérer l'adresse à partir des coordonnées utilisateur
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      getAddressFromCoords(user.latitude, user.longitude);
    }
  }, [user?.latitude, user?.longitude]);

  // Mettre à jour la localisation utilisateur si on obtient de nouvelles coordonnées
  useEffect(() => {
    if (latitude && longitude && user) {
      updateUserLocation(latitude, longitude);
      getAddressFromCoords(latitude, longitude);
    }
  }, [latitude, longitude, user?.id]);

  // État local: compétences (MVP, à persister plus tard via Supabase)
  interface SkillEntry { id: number; name: string; level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'; }

  const [skills, setSkills] = useState<SkillEntry[]>([
    { id: 1, name: 'Jardinage', level: 'Expert' },
    { id: 2, name: 'Cuisine', level: 'Intermédiaire' },
  ]);

  // Modal d'ajout
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);

  // Formulaires
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillEntry['level']>('Débutant');

  const addSkill = () => {
    const name = newSkillName.trim();
    if (!name) return;
    const currentUserId = user?.id;
    if (!currentUserId) return;
    (async () => {
      const { data, error } = await supabase
        .from('skills')
        .insert({ user_id: currentUserId, name, level: newSkillLevel })
        .select('*')
        .single();
      if (error) {
        console.error('Erreur ajout compétence:', error);
        return;
      }
      setSkills(prev => [
        ...prev,
        { id: data.id, name, level: newSkillLevel }
      ]);
      setNewSkillName('');
      setNewSkillLevel('Débutant');
      setIsAddSkillOpen(false);
    })();
  };

  const removeSkill = (id: number) => {
    const currentUserId = user?.id;
    if (!currentUserId) return;
    (async () => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId);
      if (error) {
        console.error('Erreur suppression compétence:', error);
        return;
      }
      setSkills(prev => prev.filter(s => s.id !== id));
    })();
  };



  // Chargement initial depuis Supabase
  useEffect(() => {
    const currentUserId = user?.id;
    if (!currentUserId) return;
    (async () => {
      const { data: skillRows, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', currentUserId)
        .order('id', { ascending: true });
      if (skillsError) {
        console.error('Erreur chargement compétences:', skillsError);
      } else if (skillRows) {
        setSkills(skillRows.map((row: any) => {
          const name = (row.name ?? (String(row.skill_name || '').split('|')[0] || '')).trim();
          const levelRaw = (row.level ?? (String(row.skill_name || '').split('|')[1] || 'Intermédiaire')).trim();
          const allowed = ['Débutant','Intermédiaire','Avancé','Expert'];
          const level = allowed.includes(levelRaw) ? levelRaw : 'Intermédiaire';
          return { id: row.id, name, level } as SkillEntry;
        }));
      }


    })();
  }, [user?.id]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-20">
      {/* Header amélioré avec photo de profil */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white px-6 py-12"
      >
        {/* Éléments de fond animés */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative text-center">
          <div className="relative inline-block mb-6">
            <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl text-white font-bold shadow-2xl border-4 border-white/30">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
              <Camera size={18} className="text-blue-600" />
            </button>
            <div className="absolute inset-0 bg-white/10 rounded-full animate-ping"></div>
          </div>
          
          <motion.h1 
            className="text-2xl font-bold mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {user?.name || 'Utilisateur'}
          </motion.h1>
          
          {/* Affichage de l'adresse amélioré */}
          <motion.div 
            className="flex items-center justify-center gap-2 text-blue-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Navigation size={18} />
            <div className="text-center">
              {address ? (
                <div>
                  <div className="font-medium text-sm">{address}</div>
                </div>
              ) : user?.latitude && user?.longitude ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Chargement de l'adresse...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm">Localisation non disponible</span>
                  <button
                    onClick={requestLocation}
                    className="text-[10px] bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                  >
                    Activer la localisation
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Stats Cards améliorées */}
      <div className="px-6 -mt-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="text-center bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-bold text-slate-800 mb-1">
                {stats.tasksCompleted}
              </div>
              <div className="text-xs text-slate-600 font-medium">Tâches terminées</div>
            </div>
          </Card>
          
          <Card className="text-center bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-bold text-slate-800 mb-1">
                {stats.tasksCreated}
              </div>
              <div className="text-xs text-slate-600 font-medium">Tâches créées</div>
            </div>
          </Card>
          
          <Card className="text-center bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="text-xl font-bold text-slate-800 mb-1">
                {stats.rating}
              </div>
              <div className="text-xs text-slate-600 font-medium">Note moyenne</div>
            </div>
          </Card>

          <Card className="text-center bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-bold text-slate-800 mb-1">
                {stats.memberSince}
              </div>
              <div className="text-xs text-slate-600 font-medium">Membre depuis</div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Informations personnelles améliorées */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Informations personnelles
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-slate-300 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-xl"
                >
                  <Edit size={16} className="mr-2" />
                  {isEditing ? 'Annuler' : 'Modifier'}
                </Button>
              </div>
            </div>

            <div className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Nom complet"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Input
                      label="Localisation"
                      value={editData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Votre ville ou quartier"
                      className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <Input
                    label="Bio"
                    value={editData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Parlez-nous de vous, vos passions, vos compétences..."
                    className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1 border-slate-300 hover:border-slate-400 hover:bg-slate-50 py-3 rounded-xl"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {user?.bio ? (
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        À propos de moi
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{user.bio}</p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 text-center">
                      <p className="text-sm text-amber-700 font-medium">
                        Ajoutez une bio pour que les autres membres puissent mieux vous connaître !
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-emerald-800">Localisation</div>
                          <div className="text-emerald-700">
                            {address ? (
                              <div className="font-medium text-sm">{address}</div>
                            ) : user?.location ? (
                              <div className="font-medium text-sm">{user.location}</div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <span className="text-xs">Non spécifiée</span>
                                <button
                                  onClick={requestLocation}
                                  className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full transition-colors"
                                >
                                  Activer la localisation
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-purple-800">Membre depuis</div>
                          <div className="text-sm text-purple-700 font-medium">{stats.memberSince}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Compétences améliorées */}
      <div className="px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Mes compétences
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 hover:border-emerald-500 hover:text-emerald-600 px-4 py-2 rounded-xl"
                  onClick={() => setIsAddSkillOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="p-6">
              {isAddSkillOpen && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Compétence"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Ex: Jardinage"
                    />
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Niveau</label>
                      <select
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        <option>Débutant</option>
                        <option>Intermédiaire</option>
                        <option>Avancé</option>
                        <option>Expert</option>
                      </select>
                    </div>
                    <div className="flex gap-2 items-end">
                      <Button onClick={addSkill} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Ajouter</Button>
                      <Button variant="outline" onClick={() => setIsAddSkillOpen(false)} className="flex-1 rounded-xl">Annuler</Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="group bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-slate-800 mb-1">{skill.name}</div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 text-[10px] rounded-full font-medium ${
                            skill.level === 'Expert' ? 'bg-emerald-100 text-emerald-800' :
                            skill.level === 'Avancé' ? 'bg-blue-100 text-blue-800' :
                            skill.level === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {skill.level}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                          className="p-2 hover:bg-emerald-100 hover:text-emerald-600 rounded-xl"
                          onClick={() => removeSkill(skill.id)}
                      >
                          Supprimer
                      </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {skills.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Aucune compétence ajoutée</p>
                  <p className="text-xs text-slate-400">Ajoutez vos compétences pour être trouvé plus facilement</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>



      {/* Paramètres et déconnexion améliorés */}
      <div className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Paramètres du compte
                </h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-blue-50 rounded-2xl transition-all duration-300 group border border-slate-200 hover:border-blue-300">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Settings size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">Paramètres généraux</div>
                    <div className="text-xs text-slate-500">Notifications, confidentialité, préférences</div>
                  </div>
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-red-50 rounded-2xl transition-all duration-300 group border border-slate-200 hover:border-red-300"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <LogOut size={20} className="text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-red-600 text-sm">Se déconnecter</div>
                    <div className="text-xs text-red-500">Fermer votre session en cours</div>
                  </div>
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
