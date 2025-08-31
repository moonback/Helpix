# 🤝 Guide de Contribution

Bienvenue dans le projet **Entraide Universelle** ! Ce guide vous aidera à contribuer efficacement au développement de cette plateforme d'entraide géolocalisée.

## 📋 Table des matières

- [🎯 Comment contribuer](#-comment-contribuer)
- [🚀 Premiers pas](#-premiers-pas)
- [📝 Standards de code](#-standards-de-code)
- [🔧 Workflow de développement](#-workflow-de-développement)
- [🧪 Tests](#-tests)
- [📚 Documentation](#-documentation)
- [🐛 Signaler des bugs](#-signaler-des-bugs)
- [💡 Proposer des fonctionnalités](#-proposer-des-fonctionnalités)
- [📞 Support](#-support)

## 🎯 Comment contribuer

### Types de contributions acceptées

- 🐛 **Correction de bugs** : Identification et résolution de problèmes
- ✨ **Nouvelles fonctionnalités** : Ajout de capacités utiles
- 📚 **Documentation** : Amélioration de la documentation existante
- 🎨 **UI/UX** : Améliorations de l'interface utilisateur
- 🧪 **Tests** : Ajout ou amélioration des tests
- 🔧 **Refactoring** : Amélioration du code existant
- 🚀 **Performance** : Optimisations de performance

### Niveaux de contribution

- **Débutant** : Corrections mineures, documentation, tests simples
- **Intermédiaire** : Nouvelles fonctionnalités, refactoring
- **Avancé** : Architecture, optimisations majeures, intégrations complexes

## 🚀 Premiers pas

### 1. Fork et Clone

```bash
# Fork le projet sur GitHub
# Puis clonez votre fork
git clone https://github.com/votre-username/entraide-universelle.git
cd entraide-universelle

# Ajoutez le remote upstream
git remote add upstream https://github.com/original-owner/entraide-universelle.git
```

### 2. Installation des dépendances

```bash
# Installation des dépendances
npm install

# Vérification de l'installation
npm run dev
```

### 3. Configuration de l'environnement

```bash
# Copiez le fichier d'environnement
cp .env.example .env.local

# Configurez vos variables d'environnement
# Voir README.md pour les détails
```

### 4. Branche de développement

```bash
# Créez une branche pour votre contribution
git checkout -b feature/nom-de-votre-fonctionnalite
# ou
git checkout -b fix/nom-du-bug
```

## 📝 Standards de code

### TypeScript

- **Strict mode** : Utilisez toujours le mode strict TypeScript
- **Types explicites** : Définissez des types clairs pour toutes les interfaces
- **Interfaces** : Privilégiez les interfaces aux types pour les objets
- **Imports** : Utilisez des imports/exports nommés

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
  name: string;
}

export const createUser = (userData: Omit<User, 'id'>): User => {
  // ...
};

// ❌ Éviter
type User = {
  id: string;
  email: string;
  name: string;
};
```

### React

- **Hooks** : Utilisez les hooks personnalisés pour la logique réutilisable
- **Props** : Définissez des interfaces claires pour les props
- **État** : Utilisez Zustand pour l'état global, useState pour l'état local
- **Performance** : Utilisez React.memo, useMemo, useCallback quand nécessaire

```typescript
// ✅ Bon
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
  children: React.ReactNode;
}

export const Button = React.memo<ButtonProps>(({
  variant = 'primary',
  size = 'md',
  onClick,
  children
}) => {
  // ...
});
```

### CSS/Tailwind

- **Utility-first** : Privilégiez les classes Tailwind aux CSS personnalisés
- **Responsive** : Utilisez les breakpoints Tailwind (sm:, md:, lg:, xl:)
- **Dark mode** : Supportez le mode sombre avec dark: classes
- **Accessibilité** : Utilisez les classes d'accessibilité Tailwind

```tsx
// ✅ Bon
<div className="
  flex flex-col space-y-4 
  p-4 md:p-6 lg:p-8
  bg-white dark:bg-gray-900
  rounded-lg shadow-md
  hover:shadow-lg transition-shadow
">
```

### Nommage

- **Fichiers** : PascalCase pour les composants, camelCase pour les utilitaires
- **Variables** : camelCase
- **Constantes** : UPPER_SNAKE_CASE
- **Interfaces** : PascalCase avec préfixe I (optionnel)
- **Types** : PascalCase

```typescript
// ✅ Bon
// Fichiers
Button.tsx
useAuth.ts
utils.ts

// Variables et fonctions
const userLocation = { lat: 0, lng: 0 };
const MAX_RETRY_ATTEMPTS = 3;

// Interfaces et types
interface UserProfile {
  // ...
}

type TaskStatus = 'pending' | 'in_progress' | 'completed';
```

## 🔧 Workflow de développement

### 1. Planification

- **Issue** : Créez ou assignez-vous une issue
- **Discussion** : Commentez l'issue pour clarifier les besoins
- **Estimation** : Estimez le temps de développement
- **Labels** : Ajoutez les labels appropriés (bug, enhancement, documentation)

### 2. Développement

```bash
# Mettez à jour votre branche
git fetch upstream
git rebase upstream/main

# Développez votre fonctionnalité
# Committez régulièrement avec des messages clairs
git add .
git commit -m "feat: ajouter la fonctionnalité de filtrage avancé

- Implémentation du composant FilterModal
- Ajout des options de tri par distance
- Tests unitaires pour les nouvelles fonctionnalités"
```

### 3. Tests

```bash
# Lancez les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### 4. Linting et Formatting

```bash
# Vérification du code
npm run lint

# Correction automatique
npm run lint:fix

# Formatage
npm run format
```

### 5. Pull Request

```bash
# Poussez votre branche
git push origin feature/nom-de-votre-fonctionnalite

# Créez une Pull Request sur GitHub
# Utilisez le template fourni
```

## 🧪 Tests

### Structure des tests

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── __tests__/
│           └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── features/
    └── home/
        ├── HomePage.tsx
        └── __tests__/
            └── HomePage.test.tsx
```

### Standards de test

- **Coverage** : Minimum 80% de couverture
- **Tests unitaires** : Pour tous les composants et hooks
- **Tests d'intégration** : Pour les flux utilisateur critiques
- **Mocks** : Utilisez des mocks pour les dépendances externes

```typescript
// ✅ Exemple de test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Cliquez ici</Button>);
    expect(screen.getByText('Cliquez ici')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Cliquez ici</Button>);
    
    fireEvent.click(screen.getByText('Cliquez ici'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 📚 Documentation

### Standards de documentation

- **JSDoc** : Documentez toutes les fonctions publiques
- **README** : Mettez à jour le README si nécessaire
- **Changelog** : Documentez les changements importants
- **Architecture** : Mettez à jour ARCHITECTURE.md pour les changements majeurs

```typescript
/**
 * Calcule la distance entre deux points géographiques
 * @param lat1 - Latitude du premier point
 * @param lng1 - Longitude du premier point
 * @param lat2 - Latitude du second point
 * @param lng2 - Longitude du second point
 * @returns Distance en kilomètres
 * @example
 * const distance = calculateDistance(48.8566, 2.3522, 43.2965, 5.3698);
 * console.log(distance); // Distance Paris-Marseille
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  // Implémentation...
};
```

## 🐛 Signaler des bugs

### Template de bug report

```markdown
## 🐛 Description du bug

Description claire et concise du problème.

## 🔍 Étapes pour reproduire

1. Aller sur '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

## 📱 Comportement attendu

Ce qui devrait se passer.

## 📱 Comportement actuel

Ce qui se passe actuellement.

## 🖼️ Captures d'écran

Si applicable, ajoutez des captures d'écran.

## 💻 Environnement

- OS: [ex: Windows 10, macOS 12.0]
- Navigateur: [ex: Chrome 96, Safari 15]
- Version: [ex: 1.0.0]

## 📋 Informations supplémentaires

Contexte supplémentaire, logs d'erreur, etc.
```

## 💡 Proposer des fonctionnalités

### Template de feature request

```markdown
## 🚀 Résumé

Description courte de la fonctionnalité souhaitée.

## 🎯 Problème à résoudre

Description du problème ou du besoin.

## 💡 Solution proposée

Description de la solution souhaitée.

## 🔄 Alternatives considérées

Autres solutions possibles.

## 📱 Impact utilisateur

Comment cette fonctionnalité améliorera l'expérience utilisateur.

## 🎨 Mockups/Designs

Si applicable, ajoutez des mockups ou designs.

## 📋 Critères d'acceptation

- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3
```

## 📞 Support

### Canaux de communication

- **GitHub Issues** : Pour les bugs et feature requests
- **Discussions GitHub** : Pour les questions générales
- **Email** : [votre-email@domaine.com]

### Ressources utiles

- [README.md](./README.md) - Documentation principale
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique
- [API_DOCS.md](./API_DOCS.md) - Documentation API
- [ROADMAP.md](./ROADMAP.md) - Feuille de route
- [DB_SCHEMA.md](./DB_SCHEMA.md) - Schéma de base de données

### Code de conduite

Nous nous engageons à maintenir un environnement de développement ouvert et accueillant. Tous les contributeurs doivent :

- Être respectueux et inclusifs
- Collaborer de manière constructive
- Respecter les standards de code établis
- Tester leurs contributions
- Documenter leurs changements

## 🎉 Remerciements

Merci de contribuer à **Entraide Universelle** ! Votre contribution aide à créer une plateforme d'entraide plus accessible et utile pour tous.

---

**Besoin d'aide ?** N'hésitez pas à ouvrir une issue ou à nous contacter directement !
