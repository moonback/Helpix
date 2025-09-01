import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Banknote, 
  CreditCard, 
  Wallet,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface WithdrawalFormProps {
  onSubmit: (data: any) => void;
  currentBalance: number;
}

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ onSubmit, currentBalance }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'bank_transfer',
    bankName: '',
    accountNumber: '',
    iban: '',
    paypalEmail: '',
    cryptoAddress: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation du montant
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Veuillez entrer un montant valide';
    } else if (amount > currentBalance) {
      newErrors.amount = 'Le montant ne peut pas dépasser votre solde';
    } else if (amount < 10) {
      newErrors.amount = 'Le montant minimum est de 10 crédits';
    }

    // Validation selon la méthode de paiement
    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.bankName.trim()) {
        newErrors.bankName = 'Le nom de la banque est requis';
      }
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = 'Le numéro de compte est requis';
      }
    } else if (formData.paymentMethod === 'paypal') {
      if (!formData.paypalEmail.trim()) {
        newErrors.paypalEmail = 'L\'email PayPal est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.paypalEmail)) {
        newErrors.paypalEmail = 'Veuillez entrer un email valide';
      }
    } else if (formData.paymentMethod === 'crypto') {
      if (!formData.cryptoAddress.trim()) {
        newErrors.cryptoAddress = 'L\'adresse crypto est requise';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const withdrawalData = {
        amount: parseFloat(formData.amount),
        payment_method: formData.paymentMethod,
        account_details: {
          bank_name: formData.bankName,
          account_number: formData.accountNumber,
          iban: formData.iban,
          paypal_email: formData.paypalEmail,
          crypto_address: formData.cryptoAddress
        }
      };

      await onSubmit(withdrawalData);
      
      // Reset form
      setFormData({
        amount: '',
        paymentMethod: 'bank_transfer',
        bankName: '',
        accountNumber: '',
        iban: '',
        paypalEmail: '',
        cryptoAddress: ''
      });
    } catch (error) {
      console.error('Erreur lors de la demande de retrait:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const paymentMethods = [
    {
      id: 'bank_transfer',
      label: 'Virement bancaire',
      icon: Banknote,
      description: 'Virement vers votre compte bancaire'
    },
    {
      id: 'paypal',
      label: 'PayPal',
      icon: CreditCard,
      description: 'Transfert vers votre compte PayPal'
    },
    {
      id: 'crypto',
      label: 'Cryptomonnaie',
      icon: Wallet,
      description: 'Transfert vers votre wallet crypto'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Banknote className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Demande de retrait</h3>
          <p className="text-sm text-gray-600">
            Retirez vos crédits vers votre compte
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Montant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant à retirer
          </label>
          <div className="relative">
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0"
              className={`pr-16 ${errors.amount ? 'border-red-500' : ''}`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              crédits
            </div>
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.amount}</span>
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Solde disponible: {currentBalance.toLocaleString()} crédits
          </p>
        </div>

        {/* Méthode de paiement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Méthode de paiement
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <motion.button
                  key={method.id}
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', method.id)}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all duration-200
                    ${formData.paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${
                      formData.paymentMethod === method.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className={`font-medium ${
                        formData.paymentMethod === method.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {method.label}
                      </p>
                      <p className={`text-sm ${
                        formData.paymentMethod === method.id ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Détails selon la méthode */}
        {formData.paymentMethod === 'bank_transfer' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la banque
              </label>
              <Input
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                placeholder="Ex: Crédit Agricole"
                className={errors.bankName ? 'border-red-500' : ''}
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.bankName}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de compte
              </label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="1234567890"
                className={errors.accountNumber ? 'border-red-500' : ''}
              />
              {errors.accountNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.accountNumber}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IBAN (optionnel)
              </label>
              <Input
                value={formData.iban}
                onChange={(e) => handleInputChange('iban', e.target.value)}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </div>
          </div>
        )}

        {formData.paymentMethod === 'paypal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email PayPal
            </label>
            <Input
              type="email"
              value={formData.paypalEmail}
              onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
              placeholder="votre@email.com"
              className={errors.paypalEmail ? 'border-red-500' : ''}
            />
            {errors.paypalEmail && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.paypalEmail}</span>
              </p>
            )}
          </div>
        )}

        {formData.paymentMethod === 'crypto' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse du wallet
            </label>
            <Input
              value={formData.cryptoAddress}
              onChange={(e) => handleInputChange('cryptoAddress', e.target.value)}
              placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
              className={errors.cryptoAddress ? 'border-red-500' : ''}
            />
            {errors.cryptoAddress && (
              <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.cryptoAddress}</span>
              </p>
            )}
          </div>
        )}

        {/* Informations importantes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Informations importantes :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Les retraits sont traités sous 2-5 jours ouvrables</li>
                <li>Un frais de traitement de 2% peut s'appliquer</li>
                <li>Le montant minimum de retrait est de 10 crédits</li>
                <li>Vérifiez bien vos informations avant de confirmer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            <p>Montant à recevoir: <span className="font-semibold">
              {formData.amount ? (parseFloat(formData.amount) * 0.98).toFixed(2) : '0'} crédits
            </span></p>
            <p className="text-xs">(après frais de traitement)</p>
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting || currentBalance < 10}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Demander le retrait</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default WithdrawalForm;
