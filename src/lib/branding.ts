/**
 * Textes de branding Helpix
 * Centralise tous les textes marketing et microcopy de l'application
 */

// Tagline principal
export const TAGLINE = "La solidarité près de chez vous.";

// Hero Section - Landing Page
export const HERO_CONTENT = {
  tagline: TAGLINE,
  title: "Connectez-vous à votre communauté locale",
  subtitle: "Demandez ou proposez de l'aide en quelques clics. Gagnez des crédits en rendant service à vos voisins.",
  cta: {
    primary: "Commencer maintenant",
    secondary: "Voir comment ça marche"
  },
  stats: {
    members: "10,000+ membres",
    tasks: "25,000+ tâches accomplies",
    cities: "50+ villes"
  }
};

// Fonctionnalités principales
export const FEATURES = [
  {
    icon: "📍",
    title: "Géolocalisation intelligente",
    description: "Trouvez de l'aide à moins de 5km de chez vous"
  },
  {
    icon: "💰",
    title: "Système de crédits équitable",
    description: "Gagnez des crédits en aidant, dépensez-les pour vous faire aider"
  },
  {
    icon: "💬",
    title: "Messagerie instantanée",
    description: "Communiquez en temps réel avec vos voisins"
  },
  {
    icon: "🛡️",
    title: "Sécurisé et fiable",
    description: "Profils vérifiés et paiements sécurisés"
  }
];

// Catégories populaires
export const CATEGORIES = [
  { name: "Bricolage", icon: "🔨", count: "2,500+ tâches" },
  { name: "Transport", icon: "🚗", count: "1,800+ tâches" },
  { name: "Ménage", icon: "🧹", count: "3,200+ tâches" },
  { name: "Jardinage", icon: "🌱", count: "1,100+ tâches" },
  { name: "Garde d'animaux", icon: "🐕", count: "900+ tâches" },
  { name: "Déménagement", icon: "📦", count: "600+ tâches" }
];

// Témoignages
export const TESTIMONIALS = [
  {
    text: "Grâce à Helpix, j'ai trouvé quelqu'un pour réparer ma clôture en 2h !",
    author: "Marie, 34 ans",
    location: "Lyon"
  },
  {
    text: "Je gagne 50€ par semaine en aidant mes voisins. C'est génial !",
    author: "Thomas, 28 ans", 
    location: "Marseille"
  },
  {
    text: "L'interface est super intuitive. J'ai posté ma première tâche en 3 minutes.",
    author: "Sophie, 41 ans",
    location: "Toulouse"
  }
];

// Onboarding - Slides
export const ONBOARDING_SLIDES = [
  {
    emoji: "👋",
    title: "Bienvenue sur Helpix",
    description: "La plateforme qui connecte votre quartier pour l'entraide locale",
    cta: "Commencer"
  },
  {
    emoji: "📍",
    title: "Trouvez de l'aide près de chez vous",
    description: "Activez votre localisation pour découvrir les tâches dans votre quartier",
    cta: "Activer la localisation",
    skip: "Plus tard"
  },
  {
    emoji: "💰",
    title: "Gagnez en aidant",
    description: "Proposez votre aide et gagnez des crédits. Utilisez-les pour vous faire aider !",
    cta: "Comprendre"
  },
  {
    emoji: "🎉",
    title: "Vous êtes prêt !",
    description: "Explorez les tâches près de chez vous ou créez votre première demande d'aide",
    cta: "Explorer",
    secondary: "Créer une tâche"
  }
];

// Empty States
export const EMPTY_STATES = {
  noTasks: {
    title: "Aucune tâche près de chez vous",
    description: "Soyez le premier à proposer votre aide dans votre quartier !",
    cta: "Proposer mon aide"
  },
  noOffers: {
    title: "Aucune offre reçue",
    description: "Votre tâche est en ligne. Les voisins vont bientôt vous proposer leur aide !",
    cta: "Partager la tâche"
  },
  noCredits: {
    title: "Crédits insuffisants",
    description: "Achetez des crédits pour créer votre tâche ou gagnez-en en aidant vos voisins",
    cta: "Acheter des crédits"
  }
};

// Actions principales
export const ACTIONS = {
  createTask: "Créer une tâche",
  offerHelp: "Proposer mon aide", 
  buyCredits: "Acheter des crédits",
  viewMap: "Voir sur la carte",
  sendMessage: "Envoyer un message",
  acceptOffer: "Accepter l'offre",
  markComplete: "Marquer comme terminé"
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  taskCreated: "Tâche créée ! Vos voisins vont bientôt vous proposer leur aide.",
  offerSent: "Offre envoyée ! Le demandeur va être notifié.",
  creditsPurchased: "Crédits ajoutés à votre portefeuille !",
  taskCompleted: "Tâche terminée ! Les crédits ont été transférés.",
  messageSent: "Message envoyé"
};

// Microcopy pour l'interface
export const MICROCOPY = {
  // Navigation
  home: "Accueil",
  map: "Carte",
  credits: "Crédits",
  messages: "Messages",
  profile: "Profil",
  
  // Boutons
  login: "Se connecter",
  register: "S'inscrire",
  logout: "Se déconnecter",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  edit: "Modifier",
  share: "Partager",
  
  // Formulaires
  required: "Requis",
  optional: "Optionnel",
  search: "Rechercher...",
  filter: "Filtrer",
  sort: "Trier",
  
  // États
  loading: "Chargement...",
  error: "Une erreur s'est produite",
  success: "Succès !",
  warning: "Attention",
  info: "Information"
};

// Messages d'encouragement
export const ENCOURAGEMENT_MESSAGES = [
  "Proposez votre aide, gagnez des crédits et faitez la différence !",
  "Chaque geste compte dans votre communauté locale.",
  "L'entraide commence par un simple clic.",
  "Rejoignez des milliers de voisins solidaires.",
  "Votre quartier vous attend !"
];

// Textes pour les notifications
export const NOTIFICATION_TEXTS = {
  newTaskNearby: "Nouvelle tâche près de chez vous !",
  offerReceived: "Vous avez reçu une offre d'aide",
  taskCompleted: "Tâche terminée avec succès",
  creditsEarned: "Crédits gagnés !",
  messageReceived: "Nouveau message reçu"
};

// Textes pour les emails
export const EMAIL_TEXTS = {
  welcome: {
    subject: "Bienvenue sur Helpix !",
    title: "Bienvenue dans votre nouvelle communauté locale",
    message: "Vous êtes maintenant connecté à votre quartier. Découvrez les tâches près de chez vous et commencez à aider vos voisins !"
  },
  taskReminder: {
    subject: "Rappel : Votre tâche attend toujours",
    title: "Votre tâche n'a pas encore trouvé d'aide",
    message: "N'hésitez pas à partager votre tâche ou à ajuster les détails pour attirer plus d'offres."
  }
};

// Textes pour les erreurs
export const ERROR_MESSAGES = {
  networkError: "Problème de connexion. Vérifiez votre internet.",
  locationDenied: "Localisation refusée. Activez-la pour voir les tâches près de chez vous.",
  insufficientCredits: "Crédits insuffisants pour cette action.",
  taskNotFound: "Tâche introuvable ou supprimée.",
  userNotFound: "Utilisateur introuvable.",
  genericError: "Une erreur inattendue s'est produite. Réessayez plus tard."
};

// Textes pour l'aide et FAQ
export const HELP_TEXTS = {
  howItWorks: {
    title: "Comment ça marche ?",
    steps: [
      "Créez votre compte et activez votre localisation",
      "Parcourez les tâches près de chez vous",
      "Proposez votre aide ou demandez de l'aide",
      "Communiquez via la messagerie intégrée",
      "Gagnez des crédits en aidant vos voisins"
    ]
  },
  faq: {
    title: "Questions fréquentes",
    questions: [
      {
        q: "Comment gagner des crédits ?",
        a: "Vous gagnez des crédits en aidant vos voisins à accomplir leurs tâches."
      },
      {
        q: "Les paiements sont-ils sécurisés ?",
        a: "Oui, tous les paiements sont sécurisés et traités de manière transparente."
      },
      {
        q: "Puis-je utiliser Helpix sans localisation ?",
        a: "La localisation est recommandée pour voir les tâches près de chez vous, mais vous pouvez l'activer plus tard."
      }
    ]
  }
};
