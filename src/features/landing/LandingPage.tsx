import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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
  Award,
  MessageCircle,
  Sparkles,
  Target,
  ChevronRight,
  UserCheck,
  Gift,
  Laptop,
  Camera,
  BookOpen,
  Car,
  Home,
  Paintbrush,
  Wrench
} from 'lucide-react';

// Données pour les animations et exemples
const statsData = [
  { value: '10,000+', label: 'Membres actifs', icon: <Users className="w-6 h-6" /> },
  { value: '25,000+', label: 'Tâches réalisées', icon: <CheckCircle className="w-6 h-6" /> },
  { value: '98%', label: 'Satisfaction', icon: <Star className="w-6 h-6" /> },
  { value: '24/7', label: 'Disponibilité', icon: <Clock className="w-6 h-6" /> }
];

const featuresData = [
  {
    icon: <MapPin className="w-8 h-8" />,
    title: 'Géolocalisation intelligente',
    description: 'Trouvez de l\'aide près de chez vous ou offrez vos services à votre communauté locale.',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: 'Communication sécurisée',
    description: 'Échangez directement avec les membres via notre système de messagerie intégré.',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Profils vérifiés',
    description: 'Tous les membres sont vérifiés pour garantir votre sécurité et votre confiance.',
    color: 'from-purple-500 to-violet-600'
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Système de crédits',
    description: 'Gagnez des crédits en aidant et utilisez-les pour obtenir de l\'aide en retour.',
    color: 'from-orange-500 to-red-600'
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Matching intelligent',
    description: 'Notre algorithme vous connecte avec les bonnes personnes selon vos compétences.',
    color: 'from-pink-500 to-rose-600'
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: 'Système de réputation',
    description: 'Construisez votre réputation grâce aux avis et évaluations de la communauté.',
    color: 'from-cyan-500 to-blue-600'
  }
];

const categoriesData = [
  { icon: <Wrench className="w-6 h-6" />, name: 'Bricolage', count: '2,450+ tâches' },
  { icon: <Car className="w-6 h-6" />, name: 'Transport', count: '1,820+ tâches' },
  { icon: <Home className="w-6 h-6" />, name: 'Ménage', count: '3,100+ tâches' },
  { icon: <BookOpen className="w-6 h-6" />, name: 'Cours & Formation', count: '1,650+ tâches' },
  { icon: <Camera className="w-6 h-6" />, name: 'Multimédia', count: '980+ tâches' },
  { icon: <Paintbrush className="w-6 h-6" />, name: 'Art & Design', count: '750+ tâches' },
  { icon: <Laptop className="w-6 h-6" />, name: 'Informatique', count: '2,200+ tâches' },
  { icon: <Gift className="w-6 h-6" />, name: 'Événements', count: '890+ tâches' }
];

const testimonialsData = [
  {
    name: 'Marie Dubois',
    role: 'Utilisatrice depuis 6 mois',
    avatar: '👩‍🦰',
    text: 'Grâce à Entraide Universelle, j\'ai trouvé de l\'aide pour mon déménagement en 2 heures ! La communauté est vraiment bienveillante.',
    rating: 5
  },
  {
    name: 'Pierre Martin',
    role: 'Membre actif',
    avatar: '👨‍💼',
    text: 'J\'ai pu aider plus de 50 personnes tout en développant mes compétences. Le système de crédits est génial !',
    rating: 5
  },
  {
    name: 'Sophie Laurent',
    role: 'Nouvelle utilisatrice',
    avatar: '👩‍🎓',
    text: 'Interface très intuitive et personnes de confiance. Je recommande vivement cette plateforme !',
    rating: 5
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);


  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonialsData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">Entraide Universelle</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors">Fonctionnalités</a>
              <a href="#categories" className="text-slate-600 hover:text-blue-600 transition-colors">Catégories</a>
              <a href="#testimonials" className="text-slate-600 hover:text-blue-600 transition-colors">Témoignages</a>
              <a href="#pricing" className="text-slate-600 hover:text-blue-600 transition-colors">Tarifs</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                className="text-slate-600 hover:text-slate-800"
              >
                Se connecter
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                S'inscrire
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
              className="text-5xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight"
            >
              L'entraide à portée de{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                clic
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-xl lg:text-2xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed"
            >
              Connectez-vous avec votre communauté locale pour donner et recevoir de l'aide. 
              Ensemble, créons un monde plus solidaire.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <UserCheck className="w-5 h-5 mr-2" />
                Commencer gratuitement
              </Button>
              <Button
                onClick={() => setIsVideoPlaying(true)}
                variant="outline"
                className="border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold backdrop-blur-sm hover:bg-white/50 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Voir la démo
              </Button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {statsData.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-blue-600 mb-3 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-2">{stat.value}</div>
                  <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
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
      <section id="features" className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Fonctionnalités <span className="text-blue-600">innovantes</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Des outils modernes pour faciliter l'entraide et créer des liens durables dans votre communauté.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="h-full p-8 bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Catégories <span className="text-blue-600">populaires</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Découvrez les domaines où vous pouvez aider ou recevoir de l'aide de la communauté.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categoriesData.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl border border-white/50 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-500">{category.count}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Explorer toutes les catégories
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ce que disent nos <span className="text-blue-200">membres</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
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
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {testimonialsData[currentTestimonial].avatar}
                  </div>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonialsData[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                    "{testimonialsData[currentTestimonial].text}"
                  </p>
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {testimonialsData[currentTestimonial].name}
                    </h4>
                    <p className="text-blue-200">
                      {testimonialsData[currentTestimonial].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
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
      <section className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Prêt à rejoindre la <span className="text-blue-600">communauté</span> ?
            </h2>
            <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
              Inscrivez-vous gratuitement et commencez à donner et recevoir de l'aide dès aujourd'hui.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <UserCheck className="w-6 h-6 mr-2" />
                Créer mon compte gratuit
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="border-2 border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 px-10 py-4 rounded-2xl text-lg font-semibold transition-all duration-300"
              >
                J'ai déjà un compte
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Entraide Universelle</span>
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
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#categories" className="hover:text-white transition-colors">Catégories</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Témoignages</a></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">S'inscrire</button></li>
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

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Entraide Universelle. Tous droits réservés.</p>
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
              className="bg-white rounded-3xl p-8 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Découvrez Entraide Universelle</h3>
                <button
                  onClick={() => setIsVideoPlaying(false)}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                  <p className="text-lg text-slate-600">Vidéo de démonstration</p>
                  <p className="text-sm text-slate-500 mt-2">Durée: 2:30</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
