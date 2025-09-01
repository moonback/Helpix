# 🤝 Guide de Contribution - Entraide Universelle

Merci de votre intérêt pour contribuer à Entraide Universelle ! Ce guide vous aidera à contribuer efficacement au projet.

---

## 🎯 Types de Contributions

Nous accueillons plusieurs types de contributions :

### **🐛 Corrections de Bugs**
- Signalement de bugs avec reproduction
- Corrections avec tests appropriés
- Améliorations de la robustesse

### **✨ Nouvelles Fonctionnalités**
- Propositions d'améliorations UX/UI
- Nouvelles features avec spécifications
- Optimisations de performance

### **📚 Documentation**
- Amélioration de la documentation
- Guides utilisateur et développeur
- Traductions et localisation

### **🧪 Tests**
- Tests unitaires et d'intégration
- Tests de performance
- Tests d'accessibilité

### **🎨 Design & UX**
- Améliorations d'interface
- Accessibilité et inclusion
- Animations et micro-interactions

---

## 🚀 Démarrage Rapide

### **1. Fork & Clone**
```bash
# Fork le repository sur GitHub
# Puis cloner votre fork
git clone https://github.com/VOTRE-USERNAME/entraide-universelle.git
cd entraide-universelle

# Ajouter le remote upstream
git remote add upstream https://github.com/original-owner/entraide-universelle.git
```

### **2. Installation**
```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local
# Configurer vos clés Supabase dans .env.local

# Démarrer le serveur de développement
npm run dev
```

### **3. Vérifier l'Installation**
```bash
# Lancer les tests
npm run test

# Vérifier le linting
npm run lint

# Tester le build
npm run build
```

---

## 🔄 Workflow de Contribution

### **1. Créer une Branche**
```bash
# Toujours partir de main mis à jour
git checkout main
git pull upstream main

# Créer une branche feature/bugfix
git checkout -b feature/nouvelle-fonctionnalite
# ou
git checkout -b fix/correction-bug
```

### **2. Convention de Nommage des Branches**
- `feature/nom-fonctionnalite` - Nouvelles fonctionnalités
- `fix/nom-bug` - Corrections de bugs
- `docs/sujet` - Modifications documentation
- `test/composant` - Ajout/modification tests
- `refactor/composant` - Refactoring code
- `style/composant` - Modifications CSS/UI

### **3. Développer**
```bash
# Développer votre fonctionnalité
# Commiter régulièrement avec des messages clairs

# Synchroniser avec upstream régulièrement
git fetch upstream
git rebase upstream/main
```

### **4. Tests et Qualité**
```bash
# Avant de push, vérifier :
npm run test           # Tests passent
npm run lint          # Pas d'erreurs linting
npm run build         # Build réussit
npm run test:coverage # Coverage maintenu
```

### **5. Soumettre la PR**
```bash
# Pousser votre branche
git push origin feature/nouvelle-fonctionnalite

# Créer une Pull Request sur GitHub
# Utiliser le template fourni
```

---

## 📝 Standards de Code

### **TypeScript**
```typescript
// ✅ Bon : Types explicites et interfaces claires
interface TaskProps {
  task: Task;
  onEdit: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
}

const TaskCard: React.FC<TaskProps> = ({ task, onEdit, onDelete }) => {
  // Implementation
};

// ❌ Éviter : Any types et props non typées
const TaskCard = (props: any) => {
  // Implementation
};
```

### **React Components**
```typescript
// ✅ Bon : Functional components avec hooks
const TaskList: React.FC<TaskListProps> = ({ tasks, filters }) => {
  const [loading, setLoading] = useState(false);
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => 
      filters.category ? task.category === filters.category : true
    );
  }, [tasks, filters]);

  useEffect(() => {
    // Side effects
  }, []);

  return (
    <div className="task-list">
      {/* JSX */}
    </div>
  );
};

// ❌ Éviter : Class components et inline functions
class TaskList extends Component {
  render() {
    return (
      <div>
        {tasks.map(task => 
          <Task 
            key={task.id} 
            onClick={() => this.handleClick(task.id)} 
          />
        )}
      </div>
    );
  }
}
```

### **Styles et CSS**
```typescript
// ✅ Bon : Tailwind utility classes
<button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Action
</button>

// ✅ Bon : Classes conditionnelles avec clsx
const buttonClasses = clsx(
  'font-medium py-2 px-4 rounded-lg transition-colors',
  {
    'bg-blue-500 hover:bg-blue-600 text-white': variant === 'primary',
    'bg-gray-200 hover:bg-gray-300 text-gray-800': variant === 'secondary',
  }
);

// ❌ Éviter : Styles inline
<button style={{ backgroundColor: 'blue', color: 'white' }}>
  Action
</button>
```

### **Zustand Stores**
```typescript
// ✅ Bon : Store typé avec actions claires
interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
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
  
  // Autres actions...
}));
```

---

## 🧪 Standards de Tests

### **Tests de Composants**
```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
```

### **Tests de Hooks**
```typescript
// tests/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn()
    }
  }
}));

describe('useAuth', () => {
  it('should handle sign in correctly', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.signIn('test@example.com', 'password');
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
```

### **Coverage Requirements**
- **Minimum 80%** de couverture globale
- **100%** pour les utilitaires critiques
- **90%** pour les stores Zustand
- **70%** pour les composants UI
- Tests d'intégration pour les flows critiques

---

## 📋 Conventions de Commit

### **Format des Messages**
```bash
# Format : type(scope): description

# Types :
feat(auth): add social login with Google
fix(chat): resolve message rendering issue
docs(readme): update installation instructions
test(tasks): add unit tests for task store
refactor(ui): optimize Button component performance
style(home): improve mobile responsiveness
chore(deps): update dependencies to latest versions
```

### **Types de Commits**
- `feat` - Nouvelle fonctionnalité
- `fix` - Correction de bug
- `docs` - Documentation
- `test` - Tests
- `refactor` - Refactoring sans changement fonctionnel
- `style` - Formatage, style, CSS
- `perf` - Améliorations de performance
- `chore` - Maintenance, dépendances

### **Scopes Recommandés**
- `auth` - Authentification
- `tasks` - Gestion des tâches
- `chat` - Messagerie
- `map` - Carte et géolocalisation
- `ui` - Composants UI
- `store` - Stores Zustand
- `api` - Intégrations API
- `build` - Configuration build

### **Exemples de Bons Commits**
```bash
feat(tasks): add filtering by priority and category
fix(chat): prevent duplicate messages in real-time updates
docs(api): document new authentication endpoints
test(store): add comprehensive tests for task store actions
refactor(hooks): extract geolocation logic to custom hook
style(mobile): improve navigation on small screens
perf(map): optimize marker clustering for better performance
chore(deps): upgrade React to version 18.2.0
```

---

## 🔍 Processus de Review

### **Checklist Avant Soumission**
- [ ] Code respecte les standards de style
- [ ] Tests ajoutés/mis à jour si nécessaire
- [ ] Documentation mise à jour
- [ ] Pas de console.log ou debug code
- [ ] Performance considérée
- [ ] Accessibilité vérifiée
- [ ] Mobile testé
- [ ] TypeScript strict respecté

### **Description de PR**
```markdown
## Description
Brève description de ce qui a été changé et pourquoi.

## Type de changement
- [ ] Bug fix (changement non-breaking qui corrige un problème)
- [ ] Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [ ] Breaking change (fix ou feature qui cassent la compatibilité)
- [ ] Documentation (changements de documentation uniquement)

## Comment tester
1. Aller à...
2. Cliquer sur...
3. Faire défiler jusqu'à...
4. Voir...

## Captures d'écran (si applicable)
Avant / Après ou captures des nouvelles fonctionnalités

## Checklist
- [ ] Mon code respecte les standards du projet
- [ ] J'ai fait une auto-review de mon code
- [ ] J'ai commenté mon code, particulièrement les parties complexes
- [ ] J'ai fait les changements de documentation correspondants
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests qui prouvent que ma correction/fonctionnalité marche
- [ ] Les nouveaux et anciens tests passent localement
```

### **Processus de Review**
1. **Review automatique** - CI/CD checks
2. **Review par les pairs** - Au moins 1 approval requis
3. **Review du maintainer** - Si changement majeur
4. **Tests manuels** - Sur device si UI/UX
5. **Merge** - Squash and merge préféré

---

## 🎨 Guidelines UI/UX

### **Design System**
```typescript
// Suivre le design system existant
// Colors
const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a'
  },
  gray: {
    50: '#f9fafb',
    500: '#6b7280',
    900: '#111827'
  }
};

// Spacing (Tailwind scale)
const spacing = ['0', '1', '2', '3', '4', '6', '8', '12', '16', '24'];

// Typography
const typography = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem'
};
```

### **Composants UI**
- Utiliser les composants existants quand possible
- Créer de nouveaux composants réutilisables
- Respecter les props interfaces existantes
- Ajouter des variants plutôt que dupliquer
- Tester sur mobile ET desktop

### **Accessibilité**
```typescript
// ✅ Bon : ARIA labels et semantic HTML
<button 
  aria-label="Supprimer la tâche"
  aria-describedby="delete-description"
  onClick={handleDelete}
>
  <TrashIcon />
</button>
<span id="delete-description" className="sr-only">
  Cette action supprimera définitivement la tâche
</span>

// ✅ Bon : Navigation clavier
<div 
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  onClick={handleClick}
>
  Action
</div>
```

---

## 🚨 Signalement de Bugs

### **Template d'Issue Bug**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Desktop (please complete the following information):**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Smartphone (please complete the following information):**
 - Device: [e.g. iPhone6]
 - OS: [e.g. iOS8.1]
 - Browser [e.g. stock browser, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### **Informations Importantes**
- **Étapes de reproduction** claires
- **Comportement attendu** vs **comportement actuel**
- **Screenshots/videos** si applicable
- **Environnement** (OS, navigateur, device)
- **Console logs** si erreurs JavaScript

---

## 💡 Proposition de Fonctionnalités

### **Template d'Issue Feature**
```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**User Story**
As a [type of user], I want [goal] so that [reason].
```

### **Critères d'Acceptation**
- Feature alignée avec la vision du projet
- User story claire avec bénéfice utilisateur
- Faisabilité technique évaluée
- Impact sur performance considéré
- Design/maquettes fournies si UI

---

## 🤝 Code de Conduite

### **Notre Engagement**
Nous nous engageons à faire de la participation à notre projet une expérience sans harcèlement pour tous, indépendamment de l'âge, de la taille corporelle, du handicap visible ou invisible, de l'ethnicité, des caractéristiques sexuelles, de l'identité et de l'expression de genre, du niveau d'expérience, de l'éducation, du statut socio-économique, de la nationalité, de l'apparence personnelle, de la race, de la religion ou de l'identité et de l'orientation sexuelles.

### **Standards Attendus**
- Utiliser un langage accueillant et inclusif
- Respecter les différents points de vue et expériences
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres

### **Comportements Inacceptables**
- Commentaires insultants/désobligeants et attaques personnelles ou politiques
- Harcèlement public ou privé
- Publication d'informations privées sans permission explicite
- Autre conduite qui pourrait raisonnablement être considérée comme inappropriée

---

## 📞 Support et Questions

### **Où Obtenir de l'Aide**
- **GitHub Discussions** - Questions générales et discussions
- **GitHub Issues** - Bugs et demandes de fonctionnalités
- **Discord/Slack** - Chat en temps réel (si disponible)
- **Email** - contact@entraide-universelle.fr

### **Documentation**
- **[README.md](../README.md)** - Guide de démarrage
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture technique
- **[API_DOCS.md](API_DOCS.md)** - Documentation API
- **[DB_SCHEMA.md](DB_SCHEMA.md)** - Schéma base de données

---

**Merci de contribuer à Entraide Universelle ! Ensemble, construisons un monde plus solidaire. 🤝**