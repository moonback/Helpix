# 🎯 Guide du Système de Crédit Automatique

## 📋 Vue d'ensemble

Le système de crédit automatique récompense automatiquement les utilisateurs qui aident à compléter des tâches en leur accordant des crédits dans leur wallet.

## 🔄 Fonctionnement

### **1. Déclenchement automatique**
- ✅ **Quand** : Une tâche passe au statut `completed`
- ✅ **Qui** : L'utilisateur assigné à la tâche (`assigned_to`)
- ✅ **Combien** : Le montant défini dans `budget_credits` de la tâche
- ✅ **Protection** : Un seul crédit par tâche (évite les doublons)

### **2. Processus de crédit**
1. **Vérification** : La tâche est-elle terminée et a-t-elle un utilisateur assigné ?
2. **Contrôle** : L'utilisateur a-t-il déjà été crédité pour cette tâche ?
3. **Crédit** : Création d'une transaction de crédit dans le wallet
4. **Mise à jour** : Augmentation du solde et du total gagné
5. **Log** : Enregistrement de l'opération

## 🛠️ Implémentation

### **Côté Client (React)**
```typescript
// Dans taskStore.ts - updateTaskStatus()
if (status === 'completed') {
  const success = await creditUserForTaskCompletion(
    task.assigned_to,
    taskId,
    task.budget_credits,
    task.title,
    task.user_id
  );
}
```

### **Côté Base de Données (PostgreSQL)**
```sql
-- Trigger automatique
CREATE TRIGGER trigger_credit_on_task_completion
    AFTER UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION credit_user_on_task_completion();
```

## 📊 Structure des Données

### **Transaction de Crédit**
```json
{
  "wallet_id": "uuid-du-wallet",
  "type": "credit",
  "amount": 50,
  "description": "Gain pour l'aide apportée à la tâche: Nettoyer le jardin",
  "reference_type": "task_completion",
  "reference_id": "123",
  "status": "completed",
  "metadata": {
    "task_title": "Nettoyer le jardin",
    "task_id": 123,
    "task_owner": "uuid-du-proprietaire"
  }
}
```

### **Mise à jour du Wallet**
```sql
UPDATE wallets
SET balance = balance + amount,
    total_earned = total_earned + amount,
    updated_at = NOW()
WHERE id = wallet_id;
```

## 🔍 Vérifications et Sécurité

### **1. Protection contre les doublons**
- ✅ Vérification de l'existence d'une transaction existante
- ✅ Un seul crédit par tâche et par utilisateur
- ✅ Log des tentatives de crédit multiples

### **2. Validation des données**
- ✅ Tâche assignée (`assigned_to` non null)
- ✅ Budget de crédits positif (`budget_credits > 0`)
- ✅ Wallet existant pour l'utilisateur
- ✅ Statut de la tâche = `completed`

### **3. Gestion d'erreurs**
- ✅ Ne fait pas échouer le changement de statut si le crédit échoue
- ✅ Logs détaillés pour le debugging
- ✅ Messages d'erreur informatifs

## 📈 Monitoring et Analytics

### **Vue de synthèse des crédits**
```sql
-- Voir tous les crédits accordés par tâche
SELECT * FROM task_credits_summary;
```

### **Statistiques des gains**
```sql
-- Top des utilisateurs par gains
SELECT 
    w.user_id,
    SUM(tr.amount) as total_earned,
    COUNT(tr.id) as tasks_completed
FROM wallets w
JOIN transactions tr ON w.id = tr.wallet_id
WHERE tr.type = 'credit' 
  AND tr.reference_type = 'task_completion'
GROUP BY w.user_id
ORDER BY total_earned DESC;
```

## 🚀 Utilisation

### **1. Crédit automatique**
- Se déclenche automatiquement lors de la completion d'une tâche
- Aucune action manuelle requise
- Fonctionne en arrière-plan

### **2. Crédit manuel (admin)**
```sql
-- Créditer manuellement un utilisateur
SELECT manual_credit_for_task(
    p_task_id := 123,
    p_user_id := 'uuid-utilisateur',
    p_amount := 50
);
```

### **3. Vérification des crédits**
```sql
-- Vérifier si un utilisateur a été crédité pour une tâche
SELECT hasUserBeenCreditedForTask(123);
```

## 🔧 Configuration

### **Variables importantes**
- `budget_credits` : Montant des crédits à accorder
- `assigned_to` : Utilisateur qui recevra les crédits
- `status` : Doit être `completed` pour déclencher le crédit

### **Personnalisation**
- Modifier les montants dans `budget_credits`
- Ajuster les messages dans les descriptions
- Configurer les métadonnées selon les besoins

## 🐛 Dépannage

### **Problèmes courants**

1. **Crédit non accordé**
   - Vérifier que la tâche a un `assigned_to`
   - Vérifier que `budget_credits > 0`
   - Vérifier que l'utilisateur a un wallet

2. **Crédit en double**
   - Le système empêche automatiquement les doublons
   - Vérifier la table `transactions` pour les doublons

3. **Wallet non trouvé**
   - S'assurer que l'utilisateur a un wallet créé
   - Exécuter le script de création de wallet

### **Logs utiles**
```sql
-- Voir les logs de crédit
SELECT * FROM transactions 
WHERE reference_type = 'task_completion' 
ORDER BY created_at DESC;
```

## 📝 Notes importantes

- ⚠️ **Irréversible** : Les crédits accordés ne peuvent pas être annulés automatiquement
- 🔒 **Sécurisé** : Protection contre les doublons et les erreurs
- 📊 **Traçable** : Toutes les transactions sont enregistrées
- 🔄 **Automatique** : Fonctionne sans intervention manuelle

---

**✅ Le système de crédit automatique est maintenant opérationnel !**
