import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import { OnboardingSlide } from '@/types';

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Bienvenue sur Helpix',
    description: 'La plateforme qui connecte votre quartier pour l\'entraide locale',
    icon: '👋',
  },
  {
    id: 2,
    title: 'Trouvez de l\'aide près de chez vous',
    description: 'Activez votre localisation pour découvrir les tâches dans votre quartier',
    icon: '📍',
  },
  {
    id: 3,
    title: 'Gagnez en aidant',
    description: 'Proposez votre aide et gagnez des crédits. Utilisez-les pour vous faire aider !',
    icon: '💰',
  },
  {
    id: 4,
    title: 'Vous êtes prêt !',
    description: 'Explorez les tâches près de chez vous ou créez votre première demande d\'aide',
    icon: '🎉',
  },
];

const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="text-primary-600 font-semibold text-base">
          Helpix
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToAuth}
        >
          Passer
        </Button>
      </div>

      {/* Slides */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="text-8xl mb-6">
                {onboardingSlides[currentSlide].icon}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {onboardingSlides[currentSlide].title}
              </h1>
              
              <p className="text-base text-gray-600 leading-relaxed">
                {onboardingSlides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6">
        {/* Dots */}
        <div className="flex justify-center mb-6">
          {onboardingSlides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full mx-1 transition-all duration-200 ${
                index === currentSlide ? 'bg-primary-600' : 'bg-gray-300'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            icon={<ChevronLeft size={20} />}
          >
            Précédent
          </Button>

          {currentSlide === onboardingSlides.length - 1 ? (
            <Button
              size="lg"
              onClick={goToAuth}
              icon={<Heart size={20} />}
            >
              Explorer
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={nextSlide}
              icon={<ChevronRight size={20} />}
            >
              Suivant
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
