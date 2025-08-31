# Composants de Filtres

Ce document décrit les nouveaux composants de filtres créés pour améliorer l'interface utilisateur de l'application.

## Composants Disponibles

### 1. FilterModal

Une modale élégante qui contient tous les filtres disponibles avec une interface moderne et intuitive.

**Props :**
- `isOpen: boolean` - Contrôle l'affichage de la modale
- `onClose: () => void` - Fonction appelée pour fermer la modale
- `selectedCategory: 'all' | 'local' | 'remote'` - Catégorie actuellement sélectionnée
- `selectedPriority: 'all' | 'low' | 'medium' | 'high' | 'urgent'` - Priorité actuellement sélectionnée
- `onCategoryChange: (category) => void` - Fonction appelée lors du changement de catégorie
- `onPriorityChange: (priority) => void` - Fonction appelée lors du changement de priorité

**Utilisation :**
```tsx
<FilterModal
  isOpen={isFilterModalOpen}
  onClose={() => setIsFilterModalOpen(false)}
  selectedCategory={selectedCategory}
  selectedPriority={selectedPriority}
  onCategoryChange={setSelectedCategory}
  onPriorityChange={setSelectedPriority}
/>
```

### 2. FilterButton

Un bouton de filtre avec un indicateur visuel du nombre de filtres actifs.

**Props :**
- `onClick: () => void` - Fonction appelée lors du clic
- `activeFiltersCount?: number` - Nombre de filtres actifs (optionnel)
- `variant?: 'default' | 'outline' | 'ghost'` - Variante du bouton
- `size?: 'sm' | 'md' | 'lg'` - Taille du bouton
- `className?: string` - Classes CSS supplémentaires

**Utilisation :**
```tsx
<FilterButton
  onClick={() => setIsFilterModalOpen(true)}
  activeFiltersCount={2}
  variant="outline"
  size="sm"
/>
```

### 3. FilterBadge

Un badge élégant pour afficher les filtres actifs avec possibilité de suppression.

**Props :**
- `label: string` - Texte du badge
- `icon: string` - Emoji ou icône à afficher
- `onRemove: () => void` - Fonction appelée lors de la suppression
- `variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'` - Variante de couleur
- `className?: string` - Classes CSS supplémentaires

**Utilisation :**
```tsx
<FilterBadge
  icon="📍"
  label="Sur place"
  onRemove={() => setSelectedCategory('all')}
  variant="primary"
/>
```

## Filtres Disponibles

### Catégories
- 🔍 **Toutes** - Afficher toutes les tâches
- 📍 **Sur place** - Tâches nécessitant une présence physique
- 💻 **À distance** - Tâches réalisables en ligne

### Priorités
- 🔍 **Toutes** - Afficher toutes les priorités
- 🔴 **Urgentes** - Tâches nécessitant une action immédiate
- 🟠 **Élevées** - Tâches importantes à traiter rapidement
- 🟡 **Moyennes** - Tâches avec une priorité normale
- 🟢 **Faibles** - Tâches non urgentes

## Intégration dans HomePage

La page d'accueil utilise maintenant ces composants pour offrir une expérience utilisateur améliorée :

1. **Bouton de filtre** avec indicateur du nombre de filtres actifs
2. **Affichage des filtres actifs** sous forme de badges supprimables
3. **Modale de filtres** accessible via le bouton
4. **Interface responsive** qui s'adapte à tous les écrans

## Avantages du Nouveau Design

- **Interface plus claire** : Les filtres sont organisés logiquement dans une modale
- **Meilleure UX** : Indicateurs visuels clairs et actions intuitives
- **Réutilisabilité** : Composants modulaires utilisables dans d'autres pages
- **Design moderne** : Animations fluides et interface élégante
- **Accessibilité** : Navigation clavier et contrastes appropriés

## Personnalisation

Tous les composants supportent la personnalisation via :
- Props de variantes (couleurs, tailles)
- Classes CSS personnalisées
- Thèmes via Tailwind CSS
- Animations via Framer Motion
