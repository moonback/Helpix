# 🔧 Résolution des erreurs du système Wallet

## ❌ Erreur : `ERROR: 42703: column "user_id" does not exist`

### 🎯 Cause de l'erreur
Cette erreur se produit lorsque le script SQL fait référence à une colonne `user_id` qui n'existe pas dans le contexte attendu.

### 🔍 Analyse du problème
Dans le script original, la table `transactions` avait à la fois :
- `wallet_id` (référence vers `wallets.id`)
- `user_id` (référence vers `auth.users.id`)

Cette redondance causait des conflits dans les fonctions et les politiques RLS.

### ✅ Solution appliquée

#### 1. **Simplification de la table `transactions`**
```sql
-- AVANT (problématique)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- ❌ Redondant
  -- ...
);

-- APRÈS (corrigé)
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,  -- ✅ Seule référence nécessaire
  -- ...
);
```

#### 2. **Correction des fonctions SQL**
```sql
-- AVANT (problématique)
INSERT INTO transactions (
  wallet_id, user_id, type, amount, description,  -- ❌ user_id n'existe plus
  -- ...
) VALUES (
  user_wallet.id, earning_record.user_id, 'credit', earning_record.amount,
  -- ...
);

-- APRÈS (corrigé)
INSERT INTO transactions (
  wallet_id, type, amount, description,  -- ✅ user_id supprimé
  -- ...
) VALUES (
  user_wallet.id, 'credit', earning_record.amount,
  -- ...
);
```

#### 3. **Correction des politiques RLS**
```sql
-- AVANT (problématique)
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);  -- ❌ user_id n'existe plus

-- APRÈS (corrigé)
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM wallets WHERE id = wallet_id));  -- ✅ Via wallet_id
```

#### 4. **Correction de la vue `wallet_stats`**
```sql
-- AVANT (problématique)
LEFT JOIN transactions t ON w.user_id = t.user_id  -- ❌ user_id n'existe plus

-- APRÈS (corrigé)
LEFT JOIN transactions t ON w.id = t.wallet_id  -- ✅ Via wallet_id
```

### 🧪 Tests de validation

#### Script de test
Exécutez le script `docs/TEST_STRUCTURE_WALLET.sql` pour vérifier :
- ✅ Existence des tables
- ✅ Structure des colonnes
- ✅ Contraintes de clés étrangères
- ✅ Index
- ✅ Fonctions
- ✅ Triggers
- ✅ Politiques RLS
- ✅ Vue `wallet_stats`

#### Commandes de vérification
```sql
-- Vérifier la structure de transactions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les contraintes
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'transactions' 
  AND table_schema = 'public';
```

### 🔄 Architecture corrigée

#### Relations entre tables
```
auth.users (id)
    ↓
wallets (user_id → auth.users.id)
    ↓
transactions (wallet_id → wallets.id)

credit_earnings (user_id → auth.users.id)
withdrawal_requests (user_id → auth.users.id)
payment_methods (user_id → auth.users.id)
```

#### Flux de données
1. **Utilisateur** → `auth.users`
2. **Wallet** → `wallets` (créé automatiquement)
3. **Transactions** → `transactions` (via `wallet_id`)
4. **Gains** → `credit_earnings` (via `user_id`)

### 🚀 Prochaines étapes

1. **Exécuter le script corrigé**
   ```bash
   # Dans Supabase SQL Editor
   docs/CREER_STRUCTURE_WALLET.sql
   ```

2. **Tester la structure**
   ```bash
   # Dans Supabase SQL Editor
   docs/TEST_STRUCTURE_WALLET.sql
   ```

3. **Intégrer dans l'application**
   - Mettre à jour le store Zustand
   - Tester les composants React
   - Vérifier les appels API

### 📝 Notes importantes

- **Sécurité** : Les politiques RLS garantissent que chaque utilisateur ne voit que ses propres données
- **Performance** : Les index optimisent les requêtes sur `wallet_id` et `user_id`
- **Intégrité** : Les contraintes CHECK valident les types de transactions et statuts
- **Automatisation** : Le trigger crée automatiquement un wallet à l'inscription

### 🆘 En cas de problème

Si l'erreur persiste :
1. Vérifiez que vous utilisez la version corrigée du script
2. Exécutez le script de test pour diagnostiquer
3. Vérifiez les logs Supabase pour plus de détails
4. Assurez-vous que les tables `tasks` et `help_offers` existent

---

**✅ Le système Wallet est maintenant prêt à être utilisé !**
