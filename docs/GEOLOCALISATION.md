# 🌍 Géolocalisation et Proximité

## Vue d'ensemble

La fonctionnalité de géolocalisation permet aux utilisateurs de voir les tâches les plus proches de leur position actuelle, améliorant ainsi l'expérience utilisateur en priorisant les opportunités d'entraide locales.

## 🚀 Fonctionnalités

### 1. **Géolocalisation automatique**
- Demande automatique des permissions de localisation au chargement de la page
- Récupération de la position GPS de l'utilisateur
- Mise à jour en temps réel de la position

### 2. **Tri par proximité**
- Affichage des tâches locales triées par distance
- Calcul de distance en temps réel
- Indicateurs visuels de proximité

### 3. **Gestion des permissions**
- Gestion gracieuse des refus de permission
- Messages d'erreur informatifs
- Boutons de réessai et d'aide

## 🛠️ Implémentation technique

### Hooks utilisés

#### `useGeolocation()`
```typescript
const { 
  latitude, 
  longitude, 
  accuracy, 
  error, 
  isLoading, 
  requestLocation, 
  clearLocation 
} = useGeolocation();
```

**Propriétés :**
- `latitude` : Latitude de l'utilisateur
- `longitude` : Longitude de l'utilisateur  
- `accuracy` : Précision de la localisation en mètres
- `error` : Message d'erreur si échec
- `isLoading` : État de chargement
- `requestLocation` : Fonction pour demander la localisation
- `clearLocation` : Fonction pour effacer la localisation

### Utilitaires

#### `calculateDistance(lat1, lon1, lat2, lon2)`
Calcule la distance entre deux points géographiques en utilisant la formule de Haversine.

```typescript
import { calculateDistance } from '@/lib/utils';

const distance = calculateDistance(
  userLat, userLon, 
  taskLat, taskLon
); // Retourne la distance en kilomètres
```

#### `formatDistance(distance)`
Formate une distance en texte lisible.

```typescript
import { formatDistance } from '@/lib/utils';

const formatted = formatDistance(2.5); // "2.5 km"
const formatted2 = formatDistance(0.8); // "800 m"
```

#### `sortTasksByProximity(tasks, userLat, userLon)`
Trie un tableau de tâches par proximité par rapport à une position donnée.

```typescript
import { sortTasksByProximity } from '@/lib/utils';

const sortedTasks = sortTasksByProximity(tasks, userLat, userLon);
```

### Stores

#### `useTaskStore`
```typescript
const { 
  setUserLocation, 
  getTasksByProximity 
} = useTaskStore();

// Définir la position de l'utilisateur
setUserLocation(latitude, longitude);

// Obtenir les tâches triées par proximité
const nearbyTasks = getTasksByProximity();
```

#### `useAuthStore`
```typescript
const { updateUserLocation } = useAuthStore();

// Mettre à jour la localisation en base de données
await updateUserLocation(latitude, longitude);
```

## 🎨 Composants UI

### `ProximityIndicator`
Affiche un indicateur visuel de proximité avec couleurs et icônes.

```tsx
<ProximityIndicator
  userLat={latitude}
  userLon={longitude}
  taskLat={task.latitude}
  taskLon={task.longitude}
  showIcon={true}
  className="text-sm"
/>
```

**Styles automatiques :**
- 🟢 **Très proche** (≤ 1 km) : Vert
- 🔵 **Proche** (≤ 5 km) : Bleu  
- 🟡 **Moyenne** (≤ 20 km) : Jaune
- ⚪ **Loin** (> 20 km) : Gris

### `LocationPermissionBanner`
Bannière informative pour la gestion des permissions de géolocalisation.

```tsx
<LocationPermissionBanner
  hasPermission={!!(latitude && longitude)}
  isLoading={locationLoading}
  error={locationError}
  onRequestLocation={requestLocation}
/>
```

## 🔧 Configuration

### Variables d'environnement
Aucune variable d'environnement spécifique n'est requise pour la géolocalisation.

### Permissions navigateur
La géolocalisation nécessite que l'utilisateur accorde la permission d'accès à sa position.

### Base de données
La table `users` doit contenir un champ `location` pour stocker les coordonnées.

```sql
ALTER TABLE users ADD COLUMN location TEXT;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
```

## 📱 Utilisation

### 1. **Activation automatique**
- La géolocalisation se lance automatiquement au chargement de la page
- L'utilisateur voit un indicateur de chargement

### 2. **Gestion des permissions**
- Si l'utilisateur refuse, un message d'erreur s'affiche
- Bouton "Réessayer" pour relancer la demande
- Bouton "Aide" pour accéder à la documentation navigateur

### 3. **Affichage des tâches**
- Les tâches locales sont automatiquement triées par proximité
- Chaque tâche affiche sa distance par rapport à l'utilisateur
- Toggle pour activer/désactiver le tri par proximité

### 4. **Mise à jour en temps réel**
- La position est mise à jour automatiquement
- Les tâches sont re-triées en fonction de la nouvelle position

## 🚨 Gestion des erreurs

### Types d'erreurs
1. **Permission refusée** : L'utilisateur a refusé l'accès à sa position
2. **Position indisponible** : Impossible de récupérer la position
3. **Délai dépassé** : La requête de géolocalisation a pris trop de temps
4. **Erreur inconnue** : Erreur non identifiée

### Actions de récupération
- Bouton "Réessayer" pour relancer la géolocalisation
- Lien vers la documentation d'aide du navigateur
- Fallback vers l'affichage des tâches sans tri par proximité

## 🔒 Sécurité et confidentialité

### Données collectées
- **Latitude et longitude** : Position approximative de l'utilisateur
- **Précision** : Niveau de précision de la localisation
- **Timestamp** : Moment de la récupération de la position

### Stockage
- Les coordonnées sont stockées localement dans l'état de l'application
- Optionnellement sauvegardées en base de données pour l'utilisateur connecté
- Aucune transmission à des tiers

### Contrôle utilisateur
- L'utilisateur peut refuser la géolocalisation
- Possibilité de désactiver le tri par proximité
- Pas de géolocalisation en arrière-plan

## 🧪 Tests

### Tests unitaires
```bash
npm test -- --testPathPattern=geolocation
```

### Tests d'intégration
```bash
npm run test:integration -- --testPathPattern=proximity
```

### Tests manuels
1. Ouvrir la page d'accueil
2. Vérifier la demande de permission
3. Tester le refus de permission
4. Tester l'acceptation et le tri des tâches
5. Vérifier l'affichage des distances

## 🚀 Améliorations futures

### Fonctionnalités prévues
- [ ] Géolocalisation en arrière-plan
- [ ] Notifications de nouvelles tâches à proximité
- [ ] Filtrage par rayon de recherche
- [ ] Historique des positions
- [ ] Synchronisation multi-appareils

### Optimisations techniques
- [ ] Cache des positions
- [ ] Géolocalisation par IP en fallback
- [ ] Compression des données de position
- [ ] Mise à jour différée des positions

## 📚 Ressources

### Documentation
- [MDN Geolocation API](https://developer.mozilla.org/fr/docs/Web/API/Geolocation_API)
- [W3C Geolocation Specification](https://www.w3.org/TR/geolocation/)
- [Browser Support](https://caniuse.com/geolocation)

### Outils de développement
- [Chrome DevTools Geolocation](https://developers.google.com/web/tools/chrome-devtools/device-mode/geolocation)
- [Firefox Responsive Design Mode](https://developer.mozilla.org/fr/docs/Tools/Responsive_Design_Mode)

---

**Note** : Cette fonctionnalité respecte les standards de confidentialité et de sécurité web. Aucune donnée de localisation n'est collectée sans le consentement explicite de l'utilisateur.
