# 🚨 Guide de Dépannage - Problèmes de Session

## 🔍 Diagnostic Rapide

### 1. Vérifier l'État de la Session

Utilisez le composant `SessionDebugger` (bouton "Debug Session" en bas à droite) pour vérifier :

- **État Zustand** : `isAuthenticated` et `isLoading`
- **Session Supabase** : Données de session actuelles
- **LocalStorage** : Données stockées localement
- **Cookies** : Cookies de session

### 2. Problèmes Courants et Solutions

#### ❌ Problème : Session Supabase = null mais localStorage contient des données

**Symptômes :**
- `isAuthenticated: false`
- `isLoading: true`
- Session Supabase : `null`
- LocalStorage : Contient des données d'authentification

**Solutions :**

1. **Cliquer sur "Rafraîchir Session"** dans le debugger
2. **Vider le LocalStorage** puis se reconnecter
3. **Vérifier la configuration Supabase** dans `src/lib/supabase.ts`

#### ❌ Problème : Utilisateur déconnecté après rafraîchissement (F5)

**Symptômes :**
- Connexion réussie
- Rafraîchissement de page
- Redirection vers `/onboarding`

**Solutions :**

1. **Vérifier la configuration Supabase :**
   ```typescript
   auth: {
     persistSession: true,
     autoRefreshToken: true,
     detectSessionInUrl: true,
   }
   ```

2. **Vérifier les variables d'environnement :**
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-clé-anon
   ```

3. **Nettoyer et recréer la session :**
   - Cliquer sur "Déconnecter" dans le debugger
   - Cliquer sur "Vider LocalStorage"
   - Se reconnecter

#### ❌ Problème : Erreurs de localStorage

**Symptômes :**
- Erreurs dans la console : `Cannot read properties of null`
- Composant SessionDebugger qui plante

**Solutions :**

1. **Vérifier que localStorage est disponible :**
   ```typescript
   if (typeof window !== 'undefined' && window.localStorage) {
     // Utiliser localStorage
   }
   ```

2. **Gérer les erreurs gracieusement :**
   ```typescript
   try {
     const data = localStorage.getItem('key');
   } catch (error) {
     console.warn('Erreur localStorage:', error);
   }
   ```

## 🛠️ Actions de Dépannage

### Action 1 : Rafraîchir la Session
```
1. Ouvrir le debugger (bouton "Debug Session")
2. Cliquer sur "Rafraîchir Session"
3. Vérifier que Session Supabase n'est plus null
```

### Action 2 : Nettoyer le LocalStorage
```
1. Ouvrir le debugger
2. Cliquer sur "Vider LocalStorage"
3. Rafraîchir la page
4. Se reconnecter
```

### Action 3 : Vérifier la Configuration
```
1. Vérifier src/lib/supabase.ts
2. S'assurer que persistSession: true
3. Vérifier les variables d'environnement
4. Redémarrer l'application
```

## 🔧 Configuration Recommandée

### Supabase Client
```typescript
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

### Variables d'Environnement
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

## 📊 Logs de Débogage

### Console Browser
- Vérifier les erreurs JavaScript
- Vérifier les logs d'authentification
- Vérifier les requêtes réseau

### Composant Debugger
- État de l'authentification en temps réel
- Informations sur les cookies et localStorage
- Actions de test et de nettoyage

## 🚀 Tests de Validation

### Test 1 : Persistance de Session
```
1. Se connecter
2. Vérifier isAuthenticated: true
3. Rafraîchir la page (F5)
4. Vérifier que l'utilisateur reste connecté
```

### Test 2 : Gestion des Erreurs
```
1. Simuler une erreur réseau
2. Vérifier que l'utilisateur est déconnecté
3. Vérifier l'affichage des messages d'erreur
```

### Test 3 : Déconnexion
```
1. Se déconnecter explicitement
2. Rafraîchir la page
3. Vérifier que l'utilisateur reste déconnecté
```

## 📞 Support

### Si le problème persiste :
1. **Vérifier les logs de la console**
2. **Utiliser le composant SessionDebugger**
3. **Vérifier la configuration Supabase**
4. **Tester avec un navigateur en mode incognito**
5. **Vérifier les extensions du navigateur**

### Informations à fournir :
- Version du navigateur
- Erreurs de console
- État du debugger
- Configuration Supabase
- Variables d'environnement

---

**Note :** Ce guide couvre les problèmes les plus courants. Pour des problèmes spécifiques, consultez la documentation complète dans `SESSION_PERSISTENCE.md`.
