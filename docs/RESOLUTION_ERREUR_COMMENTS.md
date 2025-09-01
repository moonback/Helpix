# 🔧 Résolution de l'erreur de commentaires

## 🚨 **Problème identifié**

```
Could not find the 'comments' column of 'tasks' in the schema cache
```

**Cause :** Le store essaie d'ajouter des commentaires automatiques lors des changements de statut, mais la colonne `comments` n'existe pas dans la table `tasks`.

## 🛠️ **Solutions appliquées**

### **Solution 1 : Désactiver les commentaires automatiques (Recommandée)**

✅ **Modifications dans `src/stores/taskStore.ts` :**
- Commenté les appels à `addTaskComment` dans `updateTaskStatus`
- Commenté les appels à `addTaskComment` dans `assignTask`
- Les commentaires automatiques sont maintenant désactivés

### **Solution 2 : Ajouter la colonne comments (Optionnelle)**

Si vous souhaitez activer les commentaires automatiques :
```sql
-- Fichier: docs/AJOUTER_COLONNE_COMMENTS.sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb;
```

## ✅ **Vérifications**

Après les corrections :

1. **Redémarrez l'application** :
   ```bash
   npm run dev
   ```

2. **Testez les changements de statut** :
   - Mettre une tâche en pause (`on_hold`)
   - Reprendre une tâche (`in_progress`)
   - Marquer comme terminée (`completed`)

3. **Vérifiez la console** :
   - Aucune erreur PGRST204
   - Les changements de statut fonctionnent

## 🎯 **Fonctionnalités disponibles**

- ✅ Bouton "Reprendre" pour les tâches en pause
- ✅ Changement de statut sans erreur
- ✅ Mise à jour du progrès
- ✅ Assignation de tâches

## 🚨 **En cas de problème**

### **Erreur persistante :**
1. Vérifiez que les commentaires automatiques sont bien désactivés
2. Vérifiez les logs de la console
3. Testez les requêtes SQL directement

### **Réactiver les commentaires :**
1. Exécutez `docs/AJOUTER_COLONNE_COMMENTS.sql`
2. Décommentez les lignes dans `taskStore.ts`
3. Redémarrez l'application

## 🎉 **Succès attendu**

Une fois les corrections appliquées :
- ✅ Aucune erreur PGRST204
- ✅ Changement de statut fonctionnel
- ✅ Bouton "Reprendre" disponible
- ✅ Système de tâches stable
