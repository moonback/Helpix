# 🚀 Guide de Déploiement du Système de Crédits

## 📋 Étapes de déploiement

### 1. **Exécuter le script SQL**
Exécutez le script `CREATE_CREDIT_TABLES.sql` dans votre base de données Supabase :

```sql
-- Copiez et exécutez le contenu du fichier CREATE_CREDIT_TABLES.sql
-- dans l'éditeur SQL de Supabase
```

**Si vous obtenez une erreur de politique existante :**
1. Exécutez d'abord `CLEANUP_CREDIT_POLICIES.sql`
2. Puis exécutez `CREATE_CREDIT_TABLES.sql`

### 2. **Vérifier les tables créées**
Assurez-vous que les tables suivantes ont été créées :
- `credit_packages`
- `credit_purchases`
- Colonnes ajoutées à `tasks` : `is_paid_task`, `creation_cost`, `creation_paid`

### 3. **Tester le système**
1. Rechargez votre application
2. Allez sur la page d'accueil
3. Vérifiez que le composant `CreditSystemInfo` s'affiche
4. Testez l'achat de crédits via le bouton "Acheter"

## 🔧 Résolution des erreurs

### Erreur 400 sur les transactions
Si vous obtenez une erreur 400 lors de la création de transactions :
1. Vérifiez que la table `transactions` existe
2. Vérifiez que la table `wallets` existe
3. Exécutez le script SQL complet si nécessaire

### Erreur DOM nesting
L'erreur "div cannot appear as a descendant of p" a été corrigée en remplaçant `<p>` par `<div>` dans `CreditSystemInfo.tsx`.

### Erreur de politique existante
Si vous obtenez l'erreur "policy already exists" :
1. Exécutez le script `CLEANUP_CREDIT_POLICIES.sql`
2. Puis réexécutez `CREATE_CREDIT_TABLES.sql`
3. Ou utilisez la version mise à jour qui inclut `DROP POLICY IF EXISTS`

### Erreur de contrainte reference_type
Si vous obtenez l'erreur "violates check constraint transactions_reference_type_check" :
1. Exécutez le script `FIX_TRANSACTIONS_SIMPLE.sql` (recommandé)
2. Ou exécutez `FIX_TRANSACTIONS_CONSTRAINTS.sql` pour plus de détails
3. Cela ajoutera les valeurs manquantes à la contrainte

## 🎯 Fonctionnalités implémentées

### ✅ Composants créés
- `CreditPurchaseModal` : Modal d'achat de crédits
- `CreditsDisplayWithPurchase` : Affichage du solde avec bouton d'achat
- `CreditCheckModal` : Vérification des crédits avant création
- `CreditSystemInfo` : Information sur le système
- `CreditPackages` : Affichage des packages dans le wallet
- `CreditSystemTest` : Composant de test

### ✅ Pages modifiées
- `HomePage` : Intégration du système de crédits
- `AddTaskPage` : Vérification des crédits avant création
- `WalletPage` : Nouvel onglet d'achat de crédits

### ✅ Base de données
- Tables : `credit_packages`, `credit_purchases`
- Colonnes : `is_paid_task`, `creation_cost`, `creation_paid`
- Politiques RLS configurées

## 🚀 Prochaines étapes

### En production
1. **Intégrer un vrai système de paiement** (Stripe, PayPal)
2. **Implémenter les fonctions SQL** pour le calcul automatique des coûts
3. **Ajouter la validation côté serveur**
4. **Configurer les webhooks de paiement**

### Améliorations
1. **Système de parrainage** avec bonus
2. **Crédits gratuits** pour les nouveaux utilisateurs
3. **Programmes de fidélité**
4. **Analytics avancées**

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de la console
2. Vérifiez que toutes les tables existent
3. Vérifiez les politiques RLS
4. Contactez le support si nécessaire

---

*Le système de crédits est maintenant prêt à être testé ! 🎉*
