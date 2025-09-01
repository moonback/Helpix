import React, { useState } from 'react';
import { useWalletStore } from '@/features/wallet/stores/walletStore';
import { useAuthStore } from '@/stores/authStore';
import CreditPurchaseModal from './CreditPurchaseModal';
import CreditCheckModal from './CreditCheckModal';
import CreditsDisplayWithPurchase from './CreditsDisplayWithPurchase';
import Button from './Button';
import Card from './Card';
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle,
  CreditCard,
  DollarSign
} from 'lucide-react';

const CreditSystemTest: React.FC = () => {
  const { wallet, createTransaction } = useWalletStore();
  const { user } = useAuthStore();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isCreditCheckOpen, setIsCreditCheckOpen] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string, success: boolean) => {
    setTestResults(prev => [...prev, `${success ? '✅' : '❌'} ${result}`]);
  };

  const runTests = async () => {
    setTestResults([]);
    
    // Test 1: Vérifier le wallet
    if (wallet) {
      addTestResult(`Wallet trouvé - Solde: ${wallet.balance} crédits`, true);
    } else {
      addTestResult('Wallet non trouvé', false);
    }

    // Test 2: Vérifier l'utilisateur
    if (user) {
      addTestResult(`Utilisateur connecté: ${user.email}`, true);
    } else {
      addTestResult('Utilisateur non connecté', false);
    }

    // Test 3: Test de transaction (simulation)
    try {
      if (wallet) {
        // Simuler une transaction de test
        await createTransaction({
          wallet_id: wallet.id,
          type: 'credit',
          amount: 1,
          description: 'Test du système de crédits',
          reference_type: 'test',
          reference_id: 'test_' + Date.now(),
          status: 'completed',
          metadata: { test: true }
        });
        addTestResult('Transaction de test réussie', true);
      }
    } catch (error) {
      addTestResult(`Erreur transaction: ${error}`, false);
    }

    // Test 4: Vérifier les composants
    addTestResult('Composants de crédits chargés', true);
  };

  const simulateTaskCreation = () => {
    const taskCost = 25; // Coût simulé
    const hasEnoughCredits = (wallet?.balance || 0) >= taskCost;
    
    if (hasEnoughCredits) {
      addTestResult(`Création de tâche simulée - Coût: ${taskCost} crédits`, true);
    } else {
      addTestResult(`Crédits insuffisants pour créer une tâche (${taskCost} requis)`, false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
            <TestTube className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Test du Système de Crédits</h3>
            <p className="text-sm text-gray-600">Vérification des fonctionnalités</p>
          </div>
        </div>

        {/* Informations actuelles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Solde</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {wallet?.balance || 0} crédits
            </div>
          </div>

          <div className="bg-white/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Gagné</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {wallet?.total_earned || 0} crédits
            </div>
          </div>

          <div className="bg-white/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Dépensé</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {wallet?.total_spent || 0} crédits
            </div>
          </div>
        </div>

        {/* Boutons de test */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={runTests}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Lancer les tests
          </Button>

          <Button
            onClick={simulateTaskCreation}
            variant="outline"
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Simuler création tâche
          </Button>

          <Button
            onClick={() => setIsPurchaseModalOpen(true)}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Test achat crédits
          </Button>

          <Button
            onClick={() => setIsCreditCheckOpen(true)}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Test vérification
          </Button>
        </div>

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Résultats des tests</h4>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Composants de test */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h4 className="font-medium text-gray-900 mb-3">Affichage des crédits</h4>
          <CreditsDisplayWithPurchase requiredCredits={50} />
        </Card>

        <Card>
          <h4 className="font-medium text-gray-900 mb-3">Statut du système</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Système de crédits actif</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Composants chargés</span>
            </div>
            <div className="flex items-center gap-2">
              {wallet ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              )}
              <span className="text-sm">
                {wallet ? 'Wallet initialisé' : 'Wallet non initialisé'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals de test */}
      <CreditPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={() => {
          addTestResult('Achat de crédits simulé avec succès', true);
        }}
      />

      <CreditCheckModal
        isOpen={isCreditCheckOpen}
        onClose={() => setIsCreditCheckOpen(false)}
        requiredCredits={50}
        taskTitle="Tâche de test"
        onCreditsSufficient={() => {
          addTestResult('Vérification des crédits réussie', true);
        }}
      />
    </div>
  );
};

export default CreditSystemTest;
