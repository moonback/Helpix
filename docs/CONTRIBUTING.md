# 🤝 Guide de Contribution - Entraide Universelle

## 🎯 Bienvenue !

Merci de votre intérêt pour contribuer à **Entraide Universelle** ! Ce guide vous aidera à comprendre comment participer au développement de cette plateforme d'entraide collaborative.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Types de Contributions](#types-de-contributions)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Workflow de Développement](#workflow-de-développement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)
- [Processus de Pull Request](#processus-de-pull-request)
- [Ressources](#ressources)

## 📜 Code de Conduite

### **Nos Valeurs**

- **🤝 Respect** : Traitez tous les contributeurs avec respect et bienveillance
- **🌍 Inclusion** : Créez un environnement accueillant pour tous
- **🎯 Collaboration** : Travaillez ensemble vers un objectif commun
- **🚀 Innovation** : Encouragez la créativité et les nouvelles idées
- **📚 Apprentissage** : Partagez vos connaissances et apprenez des autres

### **Comportements Attendus**

✅ **À FAIRE :**
- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter les critiques constructives avec grâce
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres

❌ **À ÉVITER :**
- Langage ou images à caractère sexuel ou violent
- Trolling, commentaires insultants ou désobligeants
- Harcèlement public ou privé
- Divulgation d'informations personnelles sans permission
- Autres comportements inappropriés dans un contexte professionnel

## 🎯 Types de Contributions

### **🐛 Signaler des Bugs**

1. **Vérifiez** que le bug n'a pas déjà été signalé
2. **Créez** une issue avec le template "Bug Report"
3. **Incluez** :
   - Description claire du problème
   - Étapes pour reproduire
   - Comportement attendu vs réel
   - Captures d'écran si applicable
   - Informations sur votre environnement

### **✨ Proposer des Fonctionnalités**

1. **Vérifiez** que la fonctionnalité n'existe pas déjà
2. **Créez** une issue avec le template "Feature Request"
3. **Décrivez** :
   - Le problème que cela résout
   - La solution proposée
   - Alternatives considérées
   - Impact sur les utilisateurs existants

### **💻 Contribution au Code**

1. **Fork** le repository
2. **Créez** une branche feature
3. **Développez** votre fonctionnalité
4. **Testez** vos changements
5. **Soumettez** une Pull Request

### **📚 Améliorer la Documentation**

- Corriger les erreurs de typographie
- Améliorer la clarté des explications
- Ajouter des exemples
- Traduire en d'autres langues
- Créer des tutoriels

### **🧪 Tests et Qualité**

- Écrire des tests unitaires
- Améliorer la couverture de tests
- Tester sur différents navigateurs
- Optimiser les performances
- Améliorer l'accessibilité

## 🛠️ Configuration de l'Environnement

### **Prérequis**

- **Node.js** 18+ (recommandé : 20.x LTS)
- **npm** 9+ ou **yarn** 1.22+
- **Git** 2.30+
- **Compte Supabase** (gratuit)

### **Installation**

```bash
# 1. Fork et cloner le repository
git clone https://github.com/votre-username/entraide-universelle.git
cd entraide-universelle

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# 4. Lancer en mode développement
npm run dev
```

### **Configuration Supabase**

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter les scripts SQL dans l'ordre :
   ```bash
   # Structure de base
   psql -f docs/CREER_STRUCTURE_WALLET.sql
   psql -f docs/CREATE_CREDIT_TABLES.sql
   psql -f docs/CREER_STRUCTURE_MESSAGERIE.sql
   ```
3. Configurer les variables d'environnement

## 🔄 Workflow de Développement

### **Modèle de Branches**

```
main (production)
├── develop (intégration)
├── feature/nom-fonctionnalite
├── bugfix/nom-correction
├── hotfix/correction-urgente
└── release/version-x.x.x
```

### **Convention de Nommage**

- **Branches** : `feature/user-authentication`, `bugfix/login-error`
- **Commits** : `feat: add user authentication`, `fix: resolve login error`
- **Issues** : `[Bug] Login fails on mobile`, `[Feature] Dark mode`

### **Workflow Git**

```bash
# 1. Synchroniser avec le repository principal
git remote add upstream https://github.com/original/entraide-universelle.git
git fetch upstream
git checkout main
git merge upstream/main

# 2. Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# 3. Développer et commiter
git add .
git commit -m "feat: add new feature"

# 4. Pousser vers votre fork
git push origin feature/nouvelle-fonctionnalite

# 5. Créer une Pull Request
```

## 📏 Standards de Code

### **TypeScript**

```typescript
// ✅ Bon
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const createUser = async (userData: CreateUserData): Promise<User> => {
  // Implémentation
};

// ❌ Éviter
const createUser = async (userData: any) => {
  // Implémentation sans types
};
```

### **React**

```typescript
// ✅ Bon - Composant fonctionnel avec hooks
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ variant, children, onClick }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Éviter - Composant de classe
class Button extends React.Component {
  // ...
}
```

### **CSS/Tailwind**

```css
/* ✅ Bon - Utility-first avec Tailwind */
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Titre</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>

/* ❌ Éviter - CSS custom excessif */
.custom-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### **Nommage des Fichiers**

```
✅ Bon
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   └── layout/
│       ├── Navigation.tsx
│       └── Footer.tsx
├── features/
│   ├── auth/
│   │   ├── AuthPage.tsx
│   │   └── components/
│   └── dashboard/
│       ├── DashboardPage.tsx
│       └── types/
└── hooks/
    ├── useAuth.ts
    └── useGeolocation.ts

❌ Éviter
├── components/
│   ├── button.tsx
│   ├── input.tsx
│   └── modal.tsx
├── pages/
│   ├── auth.tsx
│   └── dashboard.tsx
└── utils/
    ├── auth.ts
    └── geo.ts
```

## 🧪 Tests

### **Structure des Tests**

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       └── Button.test.tsx
├── features/
│   └── auth/
│       ├── AuthPage.tsx
│       └── AuthPage.test.tsx
└── hooks/
    ├── useAuth.ts
    └── useAuth.test.ts
```

### **Tests Unitaires**

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  test('renders with correct text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### **Tests d'Intégration**

```typescript
// AuthPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthPage } from './AuthPage';

describe('AuthPage', () => {
  test('allows user to sign in', async () => {
    render(<AuthPage />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

### **Commandes de Test**

```bash
# Tests unitaires
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests pour CI/CD
npm run test:ci
```

## 📚 Documentation

### **Commentaires JSDoc**

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

### **README des Composants**

```typescript
/**
 * @fileoverview Composant Button - Bouton réutilisable avec variants
 * @author Votre Nom
 * @version 1.0.0
 */

interface ButtonProps {
  /** Variant du bouton */
  variant: 'primary' | 'secondary' | 'danger';
  /** Contenu du bouton */
  children: React.ReactNode;
  /** Fonction appelée au clic */
  onClick?: () => void;
  /** État de désactivation */
  disabled?: boolean;
}
```

## 🔄 Processus de Pull Request

### **Avant de Soumettre**

1. **Synchronisez** votre branche avec `main`
2. **Exécutez** tous les tests : `npm test`
3. **Vérifiez** le linting : `npm run lint`
4. **Testez** manuellement votre fonctionnalité
5. **Mettez à jour** la documentation si nécessaire

### **Template de Pull Request**

```markdown
## 📝 Description
Brève description des changements apportés.

## 🔗 Issue Liée
Fixes #123

## 🧪 Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests manuels effectués

## 📸 Captures d'Écran
Ajoutez des captures d'écran si applicable.

## 📋 Checklist
- [ ] Code respecte les standards du projet
- [ ] Documentation mise à jour
- [ ] Tests passent
- [ ] Pas de conflits de merge
- [ ] Review auto-effectuée
```

### **Processus de Review**

1. **Review automatique** - CI/CD vérifie le code
2. **Review par les pairs** - Au moins 2 approbations
3. **Tests d'intégration** - Vérification sur l'environnement de test
4. **Merge** - Intégration dans la branche principale

## 🚀 Déploiement

### **Environnements**

- **Development** : `http://localhost:5173`
- **Staging** : `https://staging.entraide-universelle.com`
- **Production** : `https://entraide-universelle.com`

### **Pipeline CI/CD**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## 📞 Support et Communication

### **Canaux de Communication**

- **GitHub Issues** : Bugs et fonctionnalités
- **GitHub Discussions** : Questions et discussions
- **Discord** : Chat en temps réel (lien dans le README)
- **Email** : dev@entraide-universelle.com

### **Réunions**

- **Sprint Planning** : Chaque lundi
- **Daily Standup** : Tous les jours à 9h
- **Retrospective** : Chaque vendredi
- **Demo** : Chaque vendredi à 17h

## 🏆 Reconnaissance

### **Types de Contributions Reconnues**

- 🐛 **Bug Hunter** : Signaler des bugs critiques
- ✨ **Feature Creator** : Développer de nouvelles fonctionnalités
- 📚 **Documentation Master** : Améliorer la documentation
- 🧪 **Test Champion** : Améliorer la couverture de tests
- 🎨 **UI/UX Designer** : Améliorer l'interface utilisateur

### **Système de Badges**

- **Contributor** : Première contribution acceptée
- **Regular Contributor** : 5+ contributions
- **Core Contributor** : 20+ contributions
- **Maintainer** : Responsabilité sur une partie du projet

## 📚 Ressources

### **Documentation**

- [Architecture](ARCHITECTURE.md)
- [API Documentation](API_DOCS.md)
- [Database Schema](DB_SCHEMA.md)
- [Roadmap](ROADMAP.md)

### **Outils Recommandés**

- **IDE** : VS Code avec extensions React/TypeScript
- **Git** : GitKraken ou SourceTree
- **API Testing** : Postman ou Insomnia
- **Design** : Figma pour les maquettes

### **Formation**

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🎉 Merci !

Votre contribution fait la différence ! Ensemble, nous construisons une plateforme qui connecte les communautés et favorise l'entraide locale.

**Questions ?** N'hésitez pas à nous contacter via GitHub Issues ou Discord.

**Happy Coding !** 🚀