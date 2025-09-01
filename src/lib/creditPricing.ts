/**
 * Utilitaires pour le calcul des prix des crédits
 */

// Prix de base : 1 crédit = 0.10€ (10 crédits = 1€)
export const CREDIT_PRICE_EURO = 0.10;

/**
 * Convertit un nombre de crédits en euros
 * @param credits - Nombre de crédits
 * @returns Prix en euros
 */
export const creditsToEuros = (credits: number): number => {
  return credits * CREDIT_PRICE_EURO;
};

/**
 * Convertit un prix en euros en crédits
 * @param euros - Prix en euros
 * @returns Nombre de crédits
 */
export const eurosToCredits = (euros: number): number => {
  return Math.floor(euros / CREDIT_PRICE_EURO);
};

/**
 * Formate un prix en euros avec le symbole €
 * @param euros - Prix en euros
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns Prix formaté
 */
export const formatEuros = (euros: number, decimals: number = 2): string => {
  return `${euros.toFixed(decimals)}€`;
};

/**
 * Formate un nombre de crédits avec leur équivalent en euros
 * @param credits - Nombre de crédits
 * @returns String formatée
 */
export const formatCreditsWithEuros = (credits: number): string => {
  const euros = creditsToEuros(credits);
  return `${credits} crédits (≈ ${formatEuros(euros)})`;
};

/**
 * Calcule le coût de création d'une tâche en euros
 * @param taskCost - Coût en crédits
 * @returns Coût en euros
 */
export const getTaskCreationCostEuros = (taskCost: number): number => {
  return creditsToEuros(taskCost);
};

/**
 * Calcule le prix par crédit pour un package
 * @param packagePrice - Prix du package en euros
 * @param totalCredits - Nombre total de crédits (incluant les bonus)
 * @returns Prix par crédit en euros
 */
export const getPricePerCredit = (packagePrice: number, totalCredits: number): number => {
  return packagePrice / totalCredits;
};

/**
 * Calcule l'économie en pourcentage pour un package
 * @param packagePrice - Prix du package en euros
 * @param totalCredits - Nombre total de crédits
 * @returns Pourcentage d'économie
 */
export const getSavingsPercentage = (packagePrice: number, totalCredits: number): number => {
  const standardPrice = creditsToEuros(totalCredits);
  const savings = ((standardPrice - packagePrice) / standardPrice) * 100;
  return Math.max(0, savings);
};

/**
 * Packages de crédits avec leurs prix
 */
export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price: 4.99,
    bonus: 0,
    description: 'Parfait pour commencer'
  },
  {
    id: 'popular',
    name: 'Populaire',
    credits: 150,
    price: 12.99,
    bonus: 25,
    description: 'Le plus choisi'
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 300,
    price: 24.99,
    bonus: 75,
    description: 'Pour les utilisateurs actifs'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 600,
    price: 44.99,
    bonus: 200,
    description: 'Maximum de valeur'
  }
] as const;

/**
 * Calcule les statistiques d'un package
 * @param packageData - Données du package
 * @returns Statistiques calculées
 */
export const calculatePackageStats = (packageData: typeof CREDIT_PACKAGES[0]) => {
  const totalCredits = packageData.credits + packageData.bonus;
  const pricePerCredit = getPricePerCredit(packageData.price, totalCredits);
  const savings = getSavingsPercentage(packageData.price, totalCredits);
  const standardPrice = creditsToEuros(totalCredits);
  
  return {
    totalCredits,
    pricePerCredit,
    savings,
    standardPrice,
    actualSavings: standardPrice - packageData.price
  };
};
