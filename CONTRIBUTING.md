# 🤝 Guide de Contribution - Entraide Universelle

## 🎯 Bienvenue !

Merci de votre intérêt pour contribuer à **Entraide Universelle** ! Ce guide vous aidera à comprendre comment participer au développement de cette plateforme d'entraide communautaire.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Standards de Code](#standards-de-code)
- [Processus de Contribution](#processus-de-contribution)
- [Tests](#tests)
- [Documentation](#documentation)
- [Questions et Support](#questions-et-support)

## 📜 Code de Conduite

### **Notre Engagement**

Nous nous engageons à offrir un environnement accueillant et inclusif pour tous les contributeurs, indépendamment de leur âge, taille, handicap, ethnicité, identité et expression de genre, niveau d'expérience, éducation, statut socio-économique, nationalité, apparence personnelle, race, religion ou orientation sexuelle.

### **Nos Standards**

**Comportements Acceptables :**
- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres

**Comportements Inacceptables :**
- Langage ou images sexualisés
- Trolling, commentaires insultants ou désobligeants
- Harcèlement public ou privé
- Publication d'informations privées sans permission
- Autres comportements inappropriés dans un contexte professionnel

## 🚀 Comment Contribuer

### **Types de Contributions**

#### **🐛 Signaler un Bug**
- Vérifiez que le bug n'a pas déjà été signalé
- Utilisez le template de bug report
- Incluez des étapes de reproduction claires
- Ajoutez des captures d'écran si nécessaire

#### **✨ Proposer une Nouvelle Fonctionnalité**
- Vérifiez que la fonctionnalité n'existe pas déjà
- Utilisez le template de feature request
- Expliquez le problème que cela résout
- Décrivez la solution proposée

#### **💻 Contribuer au Code**
- Forkez le repository
- Créez une branche feature
- Implémentez vos changements
- Ajoutez des tests
- Soumettez une Pull Request

#### **📚 Améliorer la Documentation**
- Corrigez les erreurs de typo
- Améliorez la clarté
- Ajoutez des exemples
- Traduisez en d'autres langues

#### **🧪 Améliorer les Tests**
- Ajoutez des tests manquants
- Améliorez la couverture de code
- Optimisez les tests existants
- Documentez les cas de test

## 🛠️ Configuration de l'Environnement

### **Prérequis**

- **Node.js** : Version 18 ou supérieure
- **npm** : Version 9 ou supérieure
- **Git** : Version 2.30 ou supérieure
- **Supabase CLI** : Version 1.0 ou supérieure

### **Installation**

1. **Forkez le repository**
   ```bash
   # Allez sur GitHub et cliquez sur "Fork"
   ```

2. **Clonez votre fork**
   ```bash
   git clone https://github.com/VOTRE-USERNAME/entraide-universelle.git
   cd entraide-universelle
   ```

3. **Ajoutez le repository upstream**
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/entraide-universelle.git
   ```

4. **Installez les dépendances**
   ```bash
   npm install
   ```

5. **Configurez les variables d'environnement**
   ```bash
   cp .env.example .env.local
   # Éditez .env.local avec vos valeurs
   ```

6. **Lancez Supabase localement**
   ```bash
   supabase start
   ```

7. **Lancez le serveur de développement**
   ```bash
   npm run dev
   ```

### **Structure du Projet**

```
entraide-universelle/
├── src/
│   ├── components/          # Composants réutilisables
│   ├── features/           # Fonctionnalités par domaine
│   ├── hooks/              # Hooks personnalisés
│   ├── stores/             # Gestion d'état Zustand
│   ├── lib/                # Utilitaires et configurations
│   └── types/              # Types TypeScript
├── docs/                   # Documentation
├── tests/                  # Tests
└── public/                 # Assets statiques
```

## 📏 Standards de Code

### **TypeScript**

- **Strict Mode** : Toujours activé
- **Types Explicites** : Évitez `any`
- **Interfaces** : Préférez aux types pour les objets
- **Generics** : Utilisez pour la réutilisabilité

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  // Implémentation
};

// ❌ Mauvais
const createUser = async (userData: any): Promise<any> => {
  // Implémentation
};
```

### **React**

- **Fonctional Components** : Utilisez exclusivement
- **Hooks** : Préférez les hooks personnalisés
- **Props** : Interfaces claires et validation
- **Memoization** : Utilisez `React.memo` quand approprié

```typescript
// ✅ Bon
interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard = memo(({ task, onEdit, onDelete }: TaskCardProps) => {
  const handleEdit = useCallback(() => {
    onEdit(task);
  }, [task, onEdit]);

  return (
    <div className="task-card">
      {/* Contenu */}
    </div>
  );
});

// ❌ Mauvais
const TaskCard = (props: any) => {
  return <div>{props.task.title}</div>;
};
```

### **CSS/Tailwind**

- **Utility-First** : Privilégiez les classes Tailwind
- **Responsive** : Mobile-first approach
- **Consistency** : Utilisez le design system
- **Accessibility** : Classes d'accessibilité

```tsx
// ✅ Bon
<div className="flex flex-col md:flex-row gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
    Titre
  </h2>
</div>

// ❌ Mauvais
<div style={{ display: 'flex', padding: '24px', backgroundColor: 'white' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Titre</h2>
</div>
```

### **Nommage**

- **Composants** : PascalCase (`TaskCard.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.ts`)
- **Stores** : camelCase avec suffixe `Store` (`taskStore.ts`)
- **Types** : PascalCase (`TaskStatus`)
- **Interfaces** : PascalCase avec préfixe `I` optionnel (`ITask`)

## 🔄 Processus de Contribution

### **1. Créer une Branche**

```bash
# Synchronisez avec upstream
git fetch upstream
git checkout main
git merge upstream/main

# Créez une nouvelle branche
git checkout -b feature/nom-de-la-fonctionnalite
# ou
git checkout -b fix/nom-du-bug
# ou
git checkout -b docs/nom-de-la-documentation
```

### **2. Développer**

- **Commits Fréquents** : Committez souvent avec des messages clairs
- **Tests** : Écrivez des tests pour vos changements
- **Documentation** : Mettez à jour la documentation si nécessaire
- **Linting** : Vérifiez que le code passe les linters

```bash
# Vérifiez le linting
npm run lint

# Lancez les tests
npm run test

# Vérifiez les types
npm run type-check
```

### **3. Commit Messages**

Utilisez le format **Conventional Commits** :

```
type(scope): description

[optional body]

[optional footer]
```

**Types :**
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, point-virgules manquants, etc.
- `refactor` : Refactoring de code
- `test` : Ajout ou modification de tests
- `chore` : Maintenance, dépendances, etc.

**Exemples :**
```
feat(auth): add social login with Google
fix(task): resolve geolocation permission issue
docs(api): update authentication endpoints
style(ui): improve button hover states
refactor(store): optimize task filtering logic
test(auth): add unit tests for login flow
chore(deps): update React to version 18.2
```

### **4. Pull Request**

1. **Poussez votre branche**
   ```bash
   git push origin feature/nom-de-la-fonctionnalite
   ```

2. **Créez une Pull Request**
   - Utilisez le template de PR
   - Décrivez clairement vos changements
   - Référencez les issues liées
   - Ajoutez des captures d'écran si nécessaire

3. **Template de PR**
   ```markdown
   ## Description
   Brève description des changements apportés.

   ## Type de changement
   - [ ] Bug fix
   - [ ] Nouvelle fonctionnalité
   - [ ] Breaking change
   - [ ] Documentation

   ## Tests
   - [ ] Tests unitaires ajoutés/mis à jour
   - [ ] Tests d'intégration ajoutés/mis à jour
   - [ ] Tests manuels effectués

   ## Checklist
   - [ ] Code conforme aux standards
   - [ ] Documentation mise à jour
   - [ ] Tests passent
   - [ ] Linting OK
   - [ ] Types TypeScript OK
   ```

### **5. Review Process**

- **Code Review** : Au moins 2 approbations requises
- **Tests** : Tous les tests doivent passer
- **Linting** : Code conforme aux standards
- **Documentation** : Mise à jour si nécessaire

## 🧪 Tests

### **Types de Tests**

#### **Tests Unitaires**
```typescript
// tests/components/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from '@/components/TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description'
    };
    
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});
```

#### **Tests d'Intégration**
```typescript
// tests/features/task-creation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateTaskPage } from '@/features/create/CreateTaskPage';

describe('Task Creation', () => {
  it('creates a new task successfully', async () => {
    render(<CreateTaskPage />);
    
    fireEvent.change(screen.getByLabelText('Titre'), {
      target: { value: 'New Task' }
    });
    
    fireEvent.click(screen.getByText('Créer'));
    
    expect(await screen.findByText('Tâche créée avec succès')).toBeInTheDocument();
  });
});
```

#### **Tests E2E**
```typescript
// tests/e2e/user-journey.test.ts
import { test, expect } from '@playwright/test';

test('user can create and complete a task', async ({ page }) => {
  await page.goto('/');
  
  // Login
  await page.click('text=Se connecter');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('text=Connexion');
  
  // Create task
  await page.click('text=Créer une tâche');
  await page.fill('[name=title]', 'Test Task');
  await page.fill('[name=description]', 'Test Description');
  await page.click('text=Créer');
  
  // Verify task created
  await expect(page.locator('text=Test Task')).toBeVisible();
});
```

### **Lancer les Tests**

```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests en mode watch
npm run test:watch
```

## 📚 Documentation

### **Types de Documentation**

#### **Code Documentation**
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
  // Implémentation
};
```

#### **README Updates**
- Mettez à jour le README si vous ajoutez des fonctionnalités
- Ajoutez des exemples d'utilisation
- Documentez les nouvelles dépendances

#### **API Documentation**
- Documentez les nouveaux endpoints
- Ajoutez des exemples de requêtes/réponses
- Mettez à jour les schémas

### **Standards de Documentation**

- **Clarté** : Écrivez de manière claire et concise
- **Exemples** : Incluez des exemples pratiques
- **Mise à jour** : Gardez la documentation à jour
- **Accessibilité** : Utilisez un langage accessible

## 🐛 Signaler des Bugs

### **Template de Bug Report**

```markdown
## Description du Bug
Description claire et concise du bug.

## Étapes de Reproduction
1. Allez à '...'
2. Cliquez sur '...'
3. Faites défiler vers '...'
4. Voir l'erreur

## Comportement Attendu
Description de ce qui devrait se passer.

## Comportement Actuel
Description de ce qui se passe actuellement.

## Captures d'Écran
Si applicable, ajoutez des captures d'écran.

## Environnement
- OS: [ex: Windows 10, macOS 12.0, Ubuntu 20.04]
- Navigateur: [ex: Chrome 91, Firefox 89, Safari 14]
- Version: [ex: 1.2.3]

## Informations Supplémentaires
Toute autre information pertinente.
```

## ✨ Proposer des Fonctionnalités

### **Template de Feature Request**

```markdown
## Résumé de la Fonctionnalité
Description claire et concise de la fonctionnalité souhaitée.

## Problème à Résoudre
Description du problème que cette fonctionnalité résoudrait.

## Solution Proposée
Description de la solution que vous aimeriez voir implémentée.

## Alternatives Considérées
Description des solutions alternatives que vous avez considérées.

## Contexte Supplémentaire
Toute autre information ou contexte pertinent.
```

## 🤔 Questions et Support

### **Où Obtenir de l'Aide**

- **GitHub Issues** : Pour les bugs et feature requests
- **GitHub Discussions** : Pour les questions générales
- **Discord** : Pour le chat en temps réel
- **Email** : support@entraide-universelle.com

### **Ressources Utiles**

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React](https://react.dev)
- [Documentation TypeScript](https://www.typescriptlang.org/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)

## 🎉 Reconnaissance

### **Contributeurs**

Nous reconnaissons et remercions tous les contributeurs qui aident à faire d'Entraide Universelle une plateforme meilleure :

- **Code Contributors** : Développeurs qui contribuent au code
- **Documentation Contributors** : Amélioration de la documentation
- **Bug Reporters** : Signalement de bugs
- **Feature Requesters** : Suggestions de fonctionnalités
- **Community Moderators** : Modération de la communauté

### **Hall of Fame**

Les contributeurs les plus actifs sont reconnus dans notre Hall of Fame :

- 🏆 **Gold Contributors** : 100+ contributions
- 🥈 **Silver Contributors** : 50+ contributions
- 🥉 **Bronze Contributors** : 25+ contributions

## 📄 Licence

En contribuant à Entraide Universelle, vous acceptez que vos contributions soient sous la licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent ce projet possible ! Votre engagement et votre passion pour l'entraide communautaire sont ce qui fait la force de cette plateforme.

---

**Ensemble, construisons un monde plus solidaire ! 🤝**
