# 🛒 Implémentation du Marketplace Helpix

## 📋 Vue d'ensemble

Le marketplace Helpix permet aux membres de partager et louer des objets entre eux, créant une économie collaborative basée sur les crédits. Au lieu que 10 personnes achètent une perceuse, une seule est mise à disposition et louée avec des crédits.

## 🏗️ Architecture

### Base de données

#### Table `items` (étendue)
```sql
-- Colonnes existantes
id, user_id, name, description, available, is_rentable, daily_price, deposit

-- Nouvelles colonnes ajoutées
category: text -- 'tools', 'vehicles', 'sports', etc.
condition: text -- 'excellent', 'good', 'fair', 'poor'
images: text[] -- URLs des images
tags: text[] -- Tags de recherche
latitude: double precision -- Coordonnée GPS
longitude: double precision -- Coordonnée GPS
```

#### Table `rentals` (existante)
```sql
id, item_id, owner_id, renter_id, start_date, end_date, 
daily_price, total_credits, deposit_credits, status, created_at, updated_at
```

#### Table `rental_reviews` (nouvelle)
```sql
id, rental_id, item_id, reviewer_id, reviewee_id, 
rating, comment, created_at, updated_at
```

### Types TypeScript

#### `Item`
```typescript
interface Item {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  available: boolean;
  is_rentable: boolean;
  daily_price?: number;
  deposit?: number;
  category: ItemCategory;
  condition: ItemCondition;
  images?: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  tags: string[];
  created_at: string;
  updated_at?: string;
  
  // Relations
  owner?: User;
  rentals?: Rental[];
  average_rating?: number;
  total_rentals?: number;
}
```

#### `Rental`
```typescript
interface Rental {
  id: string;
  item_id: number;
  owner_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  daily_price: number;
  total_credits: number;
  deposit_credits: number;
  status: RentalStatus;
  created_at: string;
  updated_at: string;
  
  // Relations
  item?: Item;
  owner?: User;
  renter?: User;
  reviews?: RentalReview[];
}
```

## 🎯 Fonctionnalités

### 1. Catalogue d'objets
- **Catégories** : Outils, véhicules, sport, électronique, maison, jardin, livres, vêtements, musique, photo, plein air, autres
- **Recherche** : Par nom, description, tags, catégorie
- **Filtres** : Catégorie, état, prix, disponibilité, note minimale
- **Tri** : Date, prix, note, distance, popularité
- **Géolocalisation** : Tri par proximité

### 2. Gestion des objets
- **Création** : Formulaire complet avec photos, description, tarification
- **Modification** : Mise à jour des informations et disponibilité
- **Suppression** : Retrait du marketplace
- **Images** : Upload et gestion de galerie photos

### 3. Système de location
- **Demande** : Sélection des dates et calcul automatique du coût
- **Validation** : Le propriétaire accepte/refuse la demande
- **Suivi** : Statuts (demandé, accepté, actif, terminé, annulé)
- **Paiement** : Débit automatique des crédits

### 4. Système d'avis
- **Évaluation** : Note de 1 à 5 étoiles
- **Commentaires** : Avis détaillés
- **Statistiques** : Note moyenne et distribution
- **Modération** : Signalement et gestion des avis

## 🛠️ Composants

### Pages principales
- `MarketplacePage` : Page d'accueil du marketplace
- `ItemDetailPage` : Détail d'un objet avec photos et avis
- `CreateItemPage` : Création/modification d'un objet

### Composants réutilisables
- `MarketplaceItemCard` : Carte d'objet (mode grille/liste)
- `MarketplaceItemSkeleton` : Squelette de chargement
- `CategoryGrid` : Grille des catégories avec statistiques
- `StatsOverview` : Aperçu des statistiques du marketplace
- `MarketplaceFilterModal` : Modal de filtres avancés
- `RentalModal` : Modal de demande de location
- `ReviewsSection` : Section des avis avec distribution

## 🔄 Store Zustand

### `useMarketplaceStore`
```typescript
interface MarketplaceStore {
  // État
  items: Item[];
  rentals: Rental[];
  reviews: RentalReview[];
  isLoading: boolean;
  error: string | null;
  
  // Filtres et tri
  filters: MarketplaceFilter;
  sort: MarketplaceSort;
  searchQuery: string;
  
  // Actions
  fetchItems: (filters?, sort?, search?) => Promise<void>;
  createItem: (itemData) => Promise<Item>;
  updateItem: (id, updates) => Promise<void>;
  deleteItem: (id) => Promise<void>;
  requestRental: (rentalData) => Promise<Rental>;
  updateRentalStatus: (id, status) => Promise<void>;
  createReview: (reviewData) => Promise<RentalReview>;
  
  // Utilitaires
  getFilteredItems: () => Item[];
  getItemsByProximity: () => Item[];
  getMarketplaceStats: () => MarketplaceStats;
}
```

## 🎨 Design System

### Couleurs
- **Primaire** : Émeraude (emerald-500/600)
- **Secondaire** : Vert (green-500/600)
- **Accent** : Bleu pour les actions importantes

### Icônes
- **Package** : Marketplace principal
- **Calendar** : Location
- **Star** : Avis et notes
- **MapPin** : Géolocalisation
- **DollarSign** : Tarification

### Animations
- **Framer Motion** : Transitions fluides
- **Hover effects** : Interactions tactiles
- **Loading states** : Squelettes animés

## 🔒 Sécurité

### Row Level Security (RLS)
- **Items** : Lecture publique des objets rentables, modification par le propriétaire
- **Rentals** : Accès aux propriétaires et locataires uniquement
- **Reviews** : Lecture publique, écriture par le reviewer

### Validation
- **Côté client** : Validation des formulaires
- **Côté serveur** : Contraintes de base de données
- **Types** : TypeScript strict

## 📱 Responsive Design

### Breakpoints
- **Mobile** : < 640px (1 colonne)
- **Tablet** : 640px - 1024px (2-3 colonnes)
- **Desktop** : > 1024px (4+ colonnes)

### Navigation
- **Bottom Navigation** : Marketplace ajouté aux onglets principaux
- **Menu Plus** : Accès aux fonctionnalités secondaires

## 🚀 Déploiement

### Scripts SQL
1. `2025-01-27_marketplace_enhancement.sql` : Extension de la base de données
2. Données de test incluses pour les catégories

### Variables d'environnement
```bash
# Supabase Storage pour les images
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Métriques

### Statistiques du marketplace
- Nombre total d'objets
- Objets disponibles
- Locations totales
- Note moyenne
- Répartition par catégorie

### Performance
- **Lazy loading** : Images et composants
- **Pagination** : Chargement par lots
- **Cache** : Store Zustand avec persistance
- **Index** : Base de données optimisée

## 🔮 Évolutions futures

### Fonctionnalités avancées
- **Recherche géolocalisée** : Filtrage par rayon
- **Recommandations** : IA pour suggérer des objets
- **Notifications** : Alertes de disponibilité
- **Paiement** : Intégration Stripe/PayPal
- **Assurance** : Protection des objets
- **Livraison** : Service de transport

### Intégrations
- **Maps** : Affichage sur carte interactive
- **Chat** : Communication propriétaire/locataire
- **Analytics** : Suivi des performances
- **API** : Webhook pour intégrations tierces

## 🧪 Tests

### Tests unitaires
- Composants React
- Hooks personnalisés
- Store Zustand
- Utilitaires

### Tests d'intégration
- Flux de location complet
- Système d'avis
- Filtres et recherche
- Géolocalisation

## 📚 Documentation

### API
- Endpoints Supabase
- Types TypeScript
- Exemples d'utilisation

### Guides utilisateur
- Comment proposer un objet
- Comment louer un objet
- Système d'avis
- Gestion des locations

---

**Le marketplace Helpix transforme la consommation en partage, créant une économie circulaire basée sur l'entraide et les crédits.**
