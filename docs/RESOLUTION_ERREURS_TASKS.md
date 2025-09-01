# 🔧 Résolution des erreurs de la table tasks

## 🚨 **Problèmes identifiés**

### **Erreur 23514 : Contrainte de statut**
```
new row for relation "tasks" violates check constraint "tasks_status_check"
```
**Cause :** Le statut utilisé n'est pas dans la liste des valeurs autorisées.

### **Erreur PGRST204 : Colonnes manquantes**
```
Could not find the 'completed_steps' column of 'tasks' in the schema cache
Could not find the 'progress_percentage' column of 'tasks' in the schema cache
```
**Cause :** Le store essaie d'utiliser des colonnes qui n'existent pas dans la table.

## 🛠️ **Solutions**

### **Étape 1 : Diagnostic**
Exécutez le script de diagnostic :
```sql
-- Fichier: docs/DIAGNOSTIC_COMPLET_TASKS.sql
```

### **Étape 2 : Ajouter les colonnes manquantes**
```sql
-- Fichier: docs/AJOUTER_COLONNES_TASKS.sql
```

### **Étape 3 : Corriger les contraintes de statut**
```sql
-- Fichier: docs/CORRIGER_CONTRAINTES_STATUS.sql
```

### **Étape 4 : Test final**
```sql
-- Fichier: docs/TEST_FINAL_TASKS.sql
```

## 📋 **Colonnes ajoutées**

- `progress_percentage` : Pourcentage de progression (0-100)
- `completed_steps` : Nombre d'étapes terminées
- `total_steps` : Nombre total d'étapes
- `current_step` : Étape actuelle
- `time_spent` : Temps passé en minutes
- `is_overdue` : Tâche en retard
- `complexity` : Complexité (simple, moderate, complex)
- `assigned_to` : Utilisateur assigné
- `completion_date` : Date de completion
- `feedback` : Commentaires de feedback

## 🎯 **Statuts autorisés**

- `pending` : En attente
- `in_progress` : En cours
- `completed` : Terminé
- `cancelled` : Annulé
- `on_hold` : En pause

## ✅ **Vérifications**

Après avoir exécuté les scripts :

1. **Vérifiez la structure** : Toutes les colonnes doivent être présentes
2. **Testez les mises à jour** : Les erreurs PGRST204 doivent disparaître
3. **Testez les statuts** : Les erreurs 23514 doivent disparaître
4. **Redémarrez l'application** : `npm run dev`

## 🚨 **En cas de problème**

### **Erreur persistante :**
1. Vérifiez que les scripts ont été exécutés dans l'ordre
2. Vérifiez les logs Supabase
3. Testez les requêtes SQL directement

### **Données corrompues :**
1. Sauvegardez vos données importantes
2. Recréez la table si nécessaire
3. Importez les données sauvegardées

## 🎉 **Succès attendu**

Une fois les corrections appliquées :
- ✅ Aucune erreur PGRST204
- ✅ Aucune erreur 23514
- ✅ Mise à jour des tâches fonctionnelle
- ✅ Changement de statut fonctionnel
- ✅ Mise à jour du progrès fonctionnelle
