# 💰 Système de Paiement Automatique

## 📋 Vue d'ensemble

Le système de paiement automatique permet de transférer automatiquement les crédits du créateur de la tâche vers l'utilisateur qui offre son aide, une fois la tâche terminée.

## 🔄 Fonctionnement

### 1. Création d'une tâche
- L'utilisateur crée une tâche avec un budget en crédits
- Le système vérifie que l'utilisateur a suffisamment de crédits
- Si le solde est insuffisant, une alerte est affichée

### 2. Attribution d'une tâche
- Un utilisateur propose son aide et est accepté
- La tâche passe au statut "in_progress"

### 3. Finalisation de la tâche
- Quand la tâche est marquée comme "completed"
- Le système déclenche automatiquement le paiement

### 4. Traitement du paiement
- **Débit** : Les crédits sont débités du wallet du créateur
- **Crédit** : Les crédits sont crédités au wallet de l'aideur
- **Transaction** : Deux transactions sont créées (débit + crédit)
- **Notification** : Une notification de succès est affichée

## 🛠️ Composants techniques

### Fonctions principales (`src/lib/creditUtils.ts`)

#### `debitTaskOwnerForPayment()`
- Débite le créateur de la tâche
- Vérifie le solde avant débit
- Crée une transaction de type "debit"
- Met à jour le wallet du propriétaire

#### `creditUserForTaskCompletion()`
- Crédite l'utilisateur qui a aidé
- Crée une transaction de type "credit"
- Met à jour le wallet de l'aideur

#### `processTaskPayment()`
- Fonction principale qui orchestre le paiement
- Appelle d'abord le débit, puis le crédit
- Gère les erreurs et les rollbacks

#### `hasTaskPaymentBeenProcessed()`
- Vérifie si le paiement a déjà été traité
- Évite les paiements en double
- Vérifie la présence de transactions débit ET crédit

### Store de tâches (`src/stores/taskStore.ts`)

#### `updateTaskStatus()`
- Déclenche le paiement automatique quand status = "completed"
- Vérifie que la tâche a un `assigned_to` et un `budget_credits`
- Appelle `processTaskPayment()` si le paiement n'a pas encore été traité

### Composants UI

#### `PaymentNotification`
- Affiche les notifications de paiement
- Supporte différents types (success, error, warning, info)
- Auto-fermeture après 6 secondes

#### `InsufficientBalanceAlert`
- Alerte quand le solde est insuffisant
- Propose d'acheter des crédits
- Affiche le déficit en crédits

#### `usePaymentNotifications`
- Hook pour gérer les notifications
- Fonctions utilitaires pour les types courants
- Gestion de l'état des notifications

#### `useBalanceCheck`
- Hook pour vérifier le solde
- Fonction `checkBalance()` pour validation
- Fonction `canAffordTask()` pour vérification rapide

## 📊 Structure des transactions

### Transaction de débit (créateur)
```json
{
  "type": "debit",
  "amount": 50,
  "description": "Paiement pour l'aide reçue sur la tâche: Réparation ordinateur",
  "reference_type": "task_completion",
  "reference_id": "123",
  "status": "completed",
  "metadata": {
    "task_title": "Réparation ordinateur",
    "task_id": 123,
    "helper_user_id": "uuid-helper"
  }
}
```

### Transaction de crédit (aideur)
```json
{
  "type": "credit",
  "amount": 50,
  "description": "Gain pour l'aide apportée à la tâche: Réparation ordinateur",
  "reference_type": "task_completion",
  "reference_id": "123",
  "status": "completed",
  "metadata": {
    "task_title": "Réparation ordinateur",
    "task_id": 123,
    "task_owner": "uuid-owner"
  }
}
```

## 🔒 Sécurité et validation

### Vérifications avant paiement
1. **Solde suffisant** : Le créateur doit avoir assez de crédits
2. **Tâche valide** : La tâche doit exister et être assignée
3. **Paiement unique** : Évite les paiements en double
4. **Utilisateurs valides** : Vérifie l'existence des wallets

### Gestion des erreurs
- **Solde insuffisant** : Transaction échoue, notification d'erreur
- **Wallet inexistant** : Transaction échoue, log d'erreur
- **Erreur de base de données** : Transaction échoue, rollback possible

## 📱 Interface utilisateur

### Notifications
- **Succès** : Paiement traité avec succès
- **Erreur** : Échec du paiement
- **Avertissement** : Solde insuffisant
- **Info** : Tâche terminée, gains reçus

### Alertes
- **Solde insuffisant** : Affichée avant création de tâche
- **Déficit affiché** : Montant manquant en crédits
- **Bouton d'achat** : Redirection vers l'achat de crédits

## 🚀 Avantages du système

1. **Automatisation** : Aucune intervention manuelle requise
2. **Transparence** : Toutes les transactions sont tracées
3. **Sécurité** : Vérifications multiples avant paiement
4. **UX** : Notifications claires et alertes utiles
5. **Fiabilité** : Évite les paiements en double

## 🔧 Configuration

### Variables d'environnement
Aucune configuration supplémentaire requise. Le système utilise la base de données Supabase existante.

### Tables utilisées
- `wallets` : Stockage des soldes
- `transactions` : Historique des paiements
- `tasks` : Informations des tâches

## 📈 Monitoring

### Logs importants
- `✅ Paiement traité avec succès`
- `❌ Solde insuffisant`
- `⚠️ Wallet non trouvé`
- `ℹ️ Le paiement a déjà été traité`

### Métriques à surveiller
- Taux de succès des paiements
- Nombre de paiements traités par jour
- Erreurs de solde insuffisant
- Temps de traitement des paiements

## 🎯 Prochaines améliorations

1. **Système de rollback** : Annulation en cas d'erreur partielle
2. **Paiements fractionnés** : Support des paiements en plusieurs fois
3. **Frais de service** : Commission sur les transactions
4. **Historique détaillé** : Page dédiée aux paiements
5. **Notifications push** : Alertes en temps réel
6. **Statistiques** : Tableau de bord des paiements

---

**Ce système garantit un transfert automatique, sécurisé et transparent des crédits entre les utilisateurs de la plateforme d'entraide.**
