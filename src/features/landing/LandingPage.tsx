import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart,
  Users,
  MapPin,
  Star,
  Play,
  CheckCircle,
  Globe,
  Shield,
  Zap,
  Clock,
  MessageCircle,
  Sparkles,
  ChevronRight,
  UserCheck,
  Camera,
  BookOpen,
  Car,
  Home,
  Paintbrush,
  Wrench,
  Menu,
  X,
  ArrowUp
} from 'lucide-react';

// Composant Card recréé pour un fichier unique
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 ${className}`}>
      {children}
    </div>
  );
};

// Composant Button recréé pour un fichier unique
const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  className = '' 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: string; 
  className?: string; 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105';
  let variantClasses = '';
  switch (variant) {
    case 'outline':
      variantClasses = 'border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 backdrop-blur-sm hover:bg-white/50';
      break;
    case 'ghost':
      variantClasses = 'text-slate-600 hover:text-blue-600 bg-transparent hover:bg-slate-100';
      break;
    default:
      variantClasses = 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl';
      break;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </motion.button>
  );
};

// Données pour les animations et exemples
const statsData = [
  { value: '10,000+', label: 'Membres actifs', icon: <Users className="w-6 h-6" /> },
  { value: '25,000+', label: 'Tâches accomplies', icon: <CheckCircle className="w-6 h-6" /> },
  { value: '50+', label: 'Villes', icon: <MapPin className="w-6 h-6" /> },
  { value: '24/7', label: 'Disponibilité', icon: <Clock className="w-6 h-6" /> }
];

const featuresData = [
  {
    icon: <MapPin className="w-8 h-8" />,
    title: 'Géolocalisation intelligente',
    description: 'Trouvez de l\'aide à moins de 5km de chez vous',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Système de crédits équitable',
    description: 'Gagnez des crédits en aidant, dépensez-les pour vous faire aider',
    color: 'from-orange-500 to-red-600'
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: 'Messagerie instantanée',
    description: 'Communiquez en temps réel avec vos voisins',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Sécurisé et fiable',
    description: 'Profils vérifiés et paiements sécurisés',
    color: 'from-purple-500 to-violet-600'
  }
];

const categoriesData = [
  { icon: <Wrench className="w-6 h-6" />, name: 'Bricolage', count: '2,500+ tâches' },
  { icon: <Car className="w-6 h-6" />, name: 'Transport', count: '1,800+ tâches' },
  { icon: <Home className="w-6 h-6" />, name: 'Ménage', count: '3,200+ tâches' },
  { icon: <BookOpen className="w-6 h-6" />, name: 'Jardinage', count: '1,100+ tâches' },
  { icon: <Camera className="w-6 h-6" />, name: 'Garde d\'animaux', count: '900+ tâches' },
  { icon: <Paintbrush className="w-6 h-6" />, name: 'Déménagement', count: '600+ tâches' }
];

const testimonialsData = [
  {
    name: 'Marie, 34 ans',
    role: 'Lyon',
    avatar: '👩‍🦰',
    text: 'Grâce à Helpix, j\'ai trouvé quelqu\'un pour réparer ma clôture en 2h !',
    rating: 5
  },
  {
    name: 'Thomas, 28 ans',
    role: 'Marseille',
    avatar: '👨‍💼',
    text: 'Je gagne 50€ par semaine en aidant mes voisins. C\'est génial !',
    rating: 5
  },
  {
    name: 'Sophie, 41 ans',
    role: 'Toulouse',
    avatar: '👩‍🎓',
    text: 'L\'interface est super intuitive. J\'ai posté ma première tâche en 3 minutes.',
    rating: 5
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonialsData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-lg">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Helpix</span>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="text-slate-600 hover:text-blue-600 transition-colors">Fonctionnalités</a>
              <a href="#categories" onClick={(e) => handleNavLinkClick(e, 'categories')} className="text-slate-600 hover:text-blue-600 transition-colors">Catégories</a>
              <a href="#testimonials" onClick={(e) => handleNavLinkClick(e, 'testimonials')} className="text-slate-600 hover:text-blue-600 transition-colors">Témoignages</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Button onClick={() => navigate('/login')} variant="ghost" className="text-slate-600 hover:text-slate-800">
                Se connecter
              </Button>
              <Button onClick={() => navigate('/register')} className="px-6 py-2">
                S'inscrire
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 focus:outline-none focus:text-blue-600">
                {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-white/95 backdrop-blur-lg fixed inset-0 z-40 p-4"
            >
              <nav className="flex flex-col items-center justify-center space-y-8 h-full text-2xl font-bold text-slate-700">
                <a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="hover:text-blue-600 transition-colors">Fonctionnalités</a>
                <a href="#categories" onClick={(e) => handleNavLinkClick(e, 'categories')} className="hover:text-blue-600 transition-colors">Catégories</a>
                <a href="#testimonials" onClick={(e) => handleNavLinkClick(e, 'testimonials')} className="hover:text-blue-600 transition-colors">Témoignages</a>
                <a href="#" onClick={() => console.log('Tarifs')} className="hover:text-blue-600 transition-colors">Tarifs</a>
                <Button onClick={() => navigate('/login')} variant="ghost" className="text-2xl text-slate-700 hover:text-blue-600">
                  Se connecter
                </Button>
                <Button onClick={() => navigate('/register')} className="w-full text-2xl py-4">
                  S'inscrire
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-12 sm:pt-32 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Rejoignez plus de 10,000 membres actifs
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-6 leading-tight"
            >
              Connectez-vous à votre{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                communauté locale
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-base sm:text-lg text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed"
            >
              Demandez ou proposez de l'aide en quelques clics. Gagnez des crédits en rendant service à vos voisins.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Button onClick={() => navigate('/register')} className="px-6 py-3 text-base">
                <UserCheck className="w-4 h-4 mr-2" />
                Commencer maintenant
              </Button>
              <Button onClick={() => setIsVideoPlaying(true)} variant="outline" className="px-6 py-3 text-base">
                <Play className="w-4 h-4 mr-2" />
                Voir comment ça marche
              </Button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto"
            >
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 sm:p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-blue-600 mb-2 sm:mb-3 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-slate-600 text-[10px] sm:text-xs font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1 h-3 bg-slate-400 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white/50">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">
              Pourquoi choisir <span className="text-blue-600">Helpix</span> ?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              Des outils modernes pour faciliter l'entraide et créer des liens durables dans votre communauté.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {featuresData.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full p-6 sm:p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2 sm:mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 sm:py-24">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-6">
              Catégories <span className="text-blue-600">populaires</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
              Découvrez les domaines où vous pouvez aider ou recevoir de l'aide de la communauté.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {categoriesData.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <Card className="p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500">{category.count}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <Button onClick={() => navigate('/register')} className="px-4 py-2 text-sm">
              Explorer toutes les catégories
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ce que disent nos <span className="text-blue-200">membres</span>
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              Découvrez les témoignages de notre communauté bienveillante.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20"
              >
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl mb-4">
                    {testimonialsData[currentTestimonial].avatar}
                  </div>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonialsData[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-base sm:text-xl text-blue-100 mb-4 sm:mb-6 leading-relaxed">
                    "{testimonialsData[currentTestimonial].text}"
                  </p>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-white">
                      {testimonialsData[currentTestimonial].name}
                    </h4>
                    <p className="text-blue-200 text-sm sm:text-base">
                      {testimonialsData[currentTestimonial].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
              {testimonialsData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-white' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-white/50">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4 sm:mb-6">
              Prêt à rejoindre la <span className="text-blue-600">communauté</span> ?
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 sm:mb-10 max-w-3xl mx-auto">
              Inscrivez-vous gratuitement et commencez à donner et recevoir de l'aide dès aujourd'hui.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate('/register')} className="px-8 sm:px-10 py-4 text-lg">
                <UserCheck className="w-6 h-6 mr-2" />
                Créer mon compte gratuit
              </Button>
              <Button onClick={() => navigate('/login')} variant="outline" className="px-8 sm:px-10 py-4 text-lg">
                J'ai déjà un compte
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Helpix</span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                La plateforme qui connecte les communautés pour créer un monde plus solidaire et bienveillant.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#features" onClick={(e) => handleNavLinkClick(e, 'features')} className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#categories" onClick={(e) => handleNavLinkClick(e, 'categories')} className="hover:text-white transition-colors">Catégories</a></li>
                <li><a href="#testimonials" onClick={(e) => handleNavLinkClick(e, 'testimonials')} className="hover:text-white transition-colors">Témoignages</a></li>
                <li><a href="#" onClick={() => navigate('/register')} className="hover:text-white transition-colors">S'inscrire</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nous contacter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-400">
            <p>&copy; 2024 Helpix. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Découvrez Helpix</h3>
                <button
                  onClick={() => setIsVideoPlaying(false)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <div className="text-center p-4">
                  <Play className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 mx-auto mb-2 sm:mb-4" />
                  <p className="text-sm sm:text-lg text-slate-600">Vidéo de démonstration</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">Durée: 2:30</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Scroll-to-top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 p-3 sm:p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
