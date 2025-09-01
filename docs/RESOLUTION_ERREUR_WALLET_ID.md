# 🔧 Résolution de l'erreur "column wallet_id does not exist"

## ❌ Erreur : `ERROR: 42703: column "wallet_id" does not exist`

### 🎯 Cause de l'erreur
Cette erreur indique que la table `transactions` existe déjà dans votre base de données, mais avec une structure différente de celle attendue. La colonne `wallet_id` n'existe pas dans la table existante.

### 🔍 Analyse du problème
Le problème peut survenir dans plusieurs cas :
1. **Table `transactions` existante** : Une table `transactions` existe déjà avec une structure différente
2. **Exécution partielle** : Le script a été exécuté partiellement et s'est arrêté avant de créer la colonne `wallet_id`
3. **Conflit de noms** : Une autre table ou vue utilise le nom `transactions`

### ✅ Solutions

#### **Solution 1 : Diagnostic complet**
Exécutez d'abord le script de diagnostic pour comprendre l'état actuel :

```sql
-- Dans Supabase SQL Editor
docs/DIAGNOSTIC_WALLET_ERROR.sql
```

#### **Solution 2 : Correction complète (Recommandée)**
Si vous n'avez pas de données importantes dans les tables du wallet, utilisez le script de correction :

```sql
-- Dans Supabase SQL Editor
docs/CORRIGER_STRUCTURE_WALLET.sql
```

Ce script :
- ✅ Supprime toutes les tables existantes du wallet
- ✅ Recrée la structure correcte
- ✅ Ajoute tous les index, fonctions, triggers et politiques RLS
- ✅ Crée la vue `wallet_stats`

#### **Solution 3 : Correction manuelle (Si vous avez des données importantes)**
Si vous avez des données importantes à préserver :

```sql
-- 1. Sauvegarder les données existantes
CREATE TABLE transactions_backup AS SELECT * FROM transactions;

-- 2. Supprimer la table existante
DROP TABLE transactions CASCADE;

-- 3. Recréer avec la bonne structure
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit', 'withdrawal', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('task_completion', 'help_offer', 'withdrawal', 'bonus', 'refund')),
  reference_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- 4. Restaurer les données (si compatible)
-- INSERT INTO transactions SELECT * FROM transactions_backup WHERE ...;
```

### 🧪 Validation

#### **Test de la structure corrigée**
Après avoir exécuté le script de correction, testez avec :

```sql
-- Vérifier que la colonne wallet_id existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND column_name = 'wallet_id';

-- Vérifier les contraintes de clés étrangères
SELECT 
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'transactions' 
  AND tc.constraint_type = 'FOREIGN KEY';
```

#### **Test des fonctions**
```sql
-- Tester la création d'un wallet (simulation)
SELECT 'Test de création de wallet...' as message;

-- Vérifier que les fonctions existent
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN ('create_user_wallet', 'process_credit_earning', 'process_withdrawal_request');
```

### 🔄 Ordre d'exécution recommandé

1. **Diagnostic** : `docs/DIAGNOSTIC_WALLET_ERROR.sql`
2. **Correction** : `docs/CORRIGER_STRUCTURE_WALLET.sql`
3. **Test** : `docs/TEST_STRUCTURE_WALLET.sql`

### 📝 Notes importantes

- **⚠️ Attention** : Le script de correction supprime toutes les données existantes des tables du wallet
- **🔄 Sauvegarde** : Si vous avez des données importantes, sauvegardez-les avant d'exécuter le script
- **✅ Sécurité** : Les politiques RLS sont recréées pour garantir la sécurité des données
- **🚀 Performance** : Tous les index sont recréés pour optimiser les performances

### 🆘 En cas de problème persistant

Si l'erreur persiste après avoir exécuté le script de correction :

1. **Vérifiez les permissions** : Assurez-vous d'avoir les droits d'administration sur la base de données
2. **Vérifiez les dépendances** : Assurez-vous que les tables `tasks` et `help_offers` existent
3. **Consultez les logs** : Vérifiez les logs Supabase pour plus de détails
4. **Contactez le support** : Si le problème persiste, contactez le support Supabase

### 🎯 Résultat attendu

Après l'exécution du script de correction, vous devriez avoir :
- ✅ Table `wallets` avec colonne `user_id`
- ✅ Table `transactions` avec colonne `wallet_id`
- ✅ Tables `credit_earnings`, `withdrawal_requests`, `payment_methods`
- ✅ Toutes les fonctions, triggers et politiques RLS
- ✅ Vue `wallet_stats` fonctionnelle

---

**✅ Le système Wallet devrait maintenant fonctionner correctement !**
