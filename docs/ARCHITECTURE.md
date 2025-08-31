# 🏗️ Architecture Technique - Entraide Universelle

## Vue d'ensemble

L'application Entraide Universelle suit une architecture **frontend-first** avec un backend-as-a-service (Supabase) et une base de données PostgreSQL. L'architecture est conçue pour être scalable, maintenable et performante.

## 🎯 Principes Architecturaux

### **1. Séparation des Responsabilités**
- **Frontend** : Interface utilisateur et logique métier
- **Backend** : API, authentification et base de données
- **Services** : Logique métier réutilisable

### **2. Architecture Modulaire**
- Composants React réutilisables
- Hooks personnalisés pour la logique métier
- Stores Zustand pour la gestion d'état
- Services Supabase pour l'API

### **3. Performance et Scalabilité**
- Lazy loading des composants
- Optimisation des requêtes Supabase
- Mise en cache intelligente
- Code splitting avec Vite

## 🏛️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Pages     │  │ Components  │  │   Hooks     │        │
│  │             │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Stores    │  │   Utils     │  │   Types     │        │
│  │  (Zustand)  │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Client                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Auth     │  │   Database  │  │   Storage   │        │
│  │             │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Architecture Frontend

### **Structure des Composants**

```
src/
├── 📁 components/                    # Composants réutilisables
│   ├── 📁 navigation/               # Navigation et routing
│   │   └── BottomNavigation.tsx     # Navigation bottom-tab
│   └── 📁 ui/                       # Composants UI de base
│       ├── Button.tsx               # Boutons avec variantes
│       ├── Card.tsx                 # Conteneurs de contenu
│       ├── Input.tsx                # Champs de saisie
│       ├── FilterModal.tsx          # Modale de filtres
│       └── ...                      # Autres composants UI
├── 📁 features/                      # Fonctionnalités par domaine
│   ├── 📁 auth/                     # Authentification
│   │   ├── Auth.tsx                 # Page de connexion/inscription
│   │   └── Onboarding.tsx           # Onboarding utilisateur
│   ├── 📁 home/                     # Page d'accueil
│   │   └── HomePage.tsx             # Feed des tâches
│   ├── 📁 map/                      # Carte interactive
│   │   └── MapPage.tsx              # Vue carte et liste
│   ├── 📁 add/                      # Création de tâches
│   │   └── AddTaskPage.tsx          # Formulaire de création
│   ├── 📁 edit/                     # Modification de tâches
│   │   └── EditTaskPage.tsx         # Formulaire de modification
│   ├── 📁 wallet/                   # Gestion des crédits
│   │   └── WalletPage.tsx           # Interface wallet
│   ├── 📁 profile/                  # Profil utilisateur
│   │   └── ProfilePage.tsx          # Gestion du profil
│   └── 📁 chat/                     # Système de chat
│       └── ChatPage.tsx             # Interface de chat
├── 📁 hooks/                         # Hooks personnalisés
│   ├── useAuth.ts                   # Gestion de l'authentification
│   ├── useGeolocation.ts            # Géolocalisation
│   └── useReverseGeocoding.ts       # Géocodage inverse
├── 📁 stores/                        # Gestion d'état global
│   ├── authStore.ts                 # Store d'authentification
│   └── taskStore.ts                 # Store des tâches
├── 📁 lib/                           # Configuration et utilitaires
│   ├── supabase.ts                  # Client Supabase
│   ├── utils.ts                     # Fonctions utilitaires
│   └── router.ts                    # Configuration du router
└── 📁 types/                         # Types TypeScript
    └── index.ts                     # Définitions de types
```

### **Patterns Architecturaux**

#### **1. Feature-Based Architecture**
Chaque fonctionnalité est organisée dans son propre dossier avec :
- Composants spécifiques
- Hooks dédiés
- Types locaux
- Tests unitaires

#### **2. Component Composition**
- Composants atomiques réutilisables
- Props drilling minimisé
- Context API pour les données globales
- HOCs et render props si nécessaire

#### **3. State Management**
- **Zustand** pour l'état global
- **React Query** pour la gestion des données serveur
- **Local State** pour l'état des composants
- **URL State** pour la navigation

## 🔧 Architecture Backend (Supabase)

### **Services Supabase Utilisés**

#### **1. Authentication**
```typescript
// Configuration dans src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    cookieOptions: {
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      lifetime: 60 * 60 * 24 * 7, // 7 jours
    }
  }
});
```

**Fonctionnalités :**
- Inscription/Connexion avec email/mot de passe
- Gestion des sessions avec persistance
- Récupération automatique des tokens
- Politiques de sécurité configurables

#### **2. Database (PostgreSQL)**
```sql
-- Exemple de table avec RLS
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('local','remote')) DEFAULT 'local',
  status TEXT CHECK (status IN ('open','in_progress','completed','cancelled')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  estimated_duration INTEGER NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  required_skills TEXT[] DEFAULT '{}',
  budget_credits INTEGER NOT NULL DEFAULT 0,
  deadline TIMESTAMP,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Politique RLS pour la sécurité
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

#### **3. Real-time Subscriptions**
```typescript
// Exemple d'abonnement en temps réel
const subscription = supabase
  .channel('tasks')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'tasks' },
    (payload) => {
      console.log('Change received!', payload);
      // Mettre à jour l'état local
    }
  )
  .subscribe();
```

#### **4. Storage**
```typescript
// Gestion des fichiers (avatars, images de tâches)
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar.jpg', file);
```

### **Sécurité et Permissions**

#### **Row Level Security (RLS)**
- Chaque table a des politiques RLS activées
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les tâches publiques sont visibles par tous
- Les transactions sont sécurisées par utilisateur

#### **API Security**
- Clés d'API sécurisées
- Rate limiting configuré
- Validation des données côté serveur
- Protection contre les injections SQL

## 🌍 Architecture Géolocalisation

### **Stack Géolocalisation**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │useGeolocation│  │useReverseGeocoding│  │ProximityIndicator│ │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Browser APIs                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Geolocation  │  │  Nominatim  │  │  Leaflet    │        │
│  │   API       │  │  (OSM)      │  │   Maps      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### **Composants Géolocalisation**

#### **1. Hook useGeolocation**
```typescript
export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: false,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée',
        isLoading: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        // Gestion des erreurs de géolocalisation
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, []);

  return { ...state, requestLocation, clearLocation };
};
```

#### **2. Calcul de Proximité**
```typescript
// Formule de Haversine pour calculer la distance
export const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
```

## 🗺️ Architecture Cartes

### **Stack Cartographique**

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ MapPage     │  │LocationMap  │  │ProximityIndicator│   │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    React-Leaflet                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │MapContainer │  │  TileLayer  │  │   Marker    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Leaflet Core                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │OpenStreetMap│  │  Nominatim  │  │  Geocoding  │        │
│  │   Tiles     │  │   API       │  │   Service   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### **Composants Cartographiques**

#### **1. MapPage**
- Basculement entre vue carte et vue liste
- Gestion des marqueurs de tâches
- Filtrage et tri des tâches
- Modal de détails des tâches

#### **2. LocationMap**
- Affichage de la localisation sélectionnée
- Intégration avec Google Maps et OpenStreetMap
- Actions rapides (itinéraire, partage)

## 🔄 Flux de Données

### **Architecture de Données**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   UI        │    │   Store     │    │   Supabase  │
│ Component   │◄──►│  (Zustand)  │◄──►│   Client    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   State     │    │   Actions   │    │   Database  │
│   Local     │    │  (Async)    │    │ PostgreSQL  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Pattern de Gestion d'État**

#### **1. Store Zustand**
```typescript
export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  userLocation: null,

  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ tasks: data || [], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTask: async (taskData: Partial<Task>) => {
    // Logique de création
  },

  // Autres actions...
}));
```

#### **2. Hooks Personnalisés**
```typescript
export const useAuth = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    // ... autres propriétés
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    // ... autres propriétés
  };
};
```

## 🧪 Architecture des Tests

### **Structure des Tests**

```
src/
├── 📁 __tests__/                    # Tests unitaires
├── 📁 components/                    # Tests des composants
│   └── 📁 ui/
│       ├── Button.test.tsx          # Tests du composant Button
│       └── Card.test.tsx            # Tests du composant Card
├── 📁 hooks/                         # Tests des hooks
│   ├── useAuth.test.ts              # Tests du hook useAuth
│   └── useGeolocation.test.ts       # Tests du hook useGeolocation
├── 📁 stores/                        # Tests des stores
│   ├── authStore.test.ts            # Tests du store auth
│   └── taskStore.test.ts            # Tests du store task
└── 📁 setupTests.ts                  # Configuration des tests
```

### **Configuration Jest**

```javascript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
};
```

## 🚀 Performance et Optimisation

### **Stratégies d'Optimisation**

#### **1. Code Splitting**
```typescript
// Lazy loading des pages
const HomePage = lazy(() => import('@/features/home/HomePage'));
const MapPage = lazy(() => import('@/features/map/MapPage'));
const AddTaskPage = lazy(() => import('@/features/add/AddTaskPage'));
```

#### **2. Memoization**
```typescript
// Optimisation des composants avec React.memo
const TaskCard = React.memo(({ task, onAction }: TaskCardProps) => {
  // Composant optimisé
});

// Optimisation des calculs coûteux
const sortedTasks = useMemo(() => {
  return sortTasksByProximity(tasks, userLat, userLon);
}, [tasks, userLat, userLon]);
```

#### **3. Debouncing**
```typescript
// Recherche avec debounce
useEffect(() => {
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }

  if (query.length >= 3) {
    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(query);
    }, 300);
  }
}, [query]);
```

### **Métriques de Performance**

- **First Contentful Paint (FCP)** : < 1.5s
- **Largest Contentful Paint (LCP)** : < 2.5s
- **Cumulative Layout Shift (CLS)** : < 0.1
- **First Input Delay (FID)** : < 100ms

## 🔒 Sécurité

### **Couches de Sécurité**

#### **1. Frontend**
- Validation des formulaires côté client
- Sanitisation des entrées utilisateur
- Protection XSS avec React
- Gestion sécurisée des tokens

#### **2. Backend (Supabase)**
- Row Level Security (RLS)
- Politiques d'accès granulaires
- Validation des données côté serveur
- Rate limiting et protection DDoS

#### **3. Communication**
- HTTPS obligatoire en production
- Tokens JWT sécurisés
- Cookies avec flags de sécurité
- Headers de sécurité HTTP

## 📱 Responsive Design

### **Breakpoints et Adaptations**

```css
/* Mobile First Approach */
.container {
  @apply px-4 py-2; /* Base mobile */
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    @apply px-6 py-4;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    @apply px-8 py-6;
  }
}
```

### **Composants Adaptatifs**

- **BottomNavigation** : Navigation mobile-first
- **Grid Layouts** : Adaptation automatique des colonnes
- **Touch Targets** : Minimum 44px pour les interactions tactiles
- **Typography** : Échelle responsive des tailles de police

## 🔮 Évolutions Futures

### **Architecture Cible**

#### **1. Microservices**
- Séparation des domaines métier
- API Gateway centralisé
- Communication inter-services
- Déploiement indépendant

#### **2. PWA (Progressive Web App)**
- Service Workers pour le cache
- Mode hors ligne
- Notifications push
- Installation native

#### **3. GraphQL**
- API unifiée et flexible
- Requêtes optimisées
- Subscriptions en temps réel
- Schema-first development

---

**Cette architecture est conçue pour évoluer avec les besoins de l'application tout en maintenant la qualité et la maintenabilité du code.**
