import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';

const Auth: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const { signIn, signUp, isLoading, error } = useAuthStore();

  // Mettre à jour l'état basé sur l'URL
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, formData.name);
      }
      
      // Redirection après authentification réussie
      navigate('/home');
    } catch (error) {
      // L'erreur est gérée par le store
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? 'Reconnectez-vous à votre compte' 
              : 'Créez votre compte pour commencer'
            }
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 space-y-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {!isLogin && (
            <Input
              label="Nom complet"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Votre nom complet"
              leftIcon={User}
              required
              autoComplete="name"
            />
          )}

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="votre@email.com"
            leftIcon={Mail}
            required
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Votre mot de passe"
            leftIcon={Lock}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            {isLoading 
              ? 'Chargement...' 
              : (isLogin ? 'Se connecter' : 'S\'inscrire')
            }
          </Button>

          {/* Toggle Auth Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                if (isLogin) {
                  navigate('/register');
                } else {
                  navigate('/login');
                }
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            >
              {isLogin 
                ? 'Pas encore de compte ? S\'inscrire' 
                : 'Déjà un compte ? Se connecter'
              }
            </button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Auth;
