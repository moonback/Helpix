-- =====================================================
-- Script simplifié pour créer les tables de crédits
-- =====================================================

-- 1. Créer la table des packages de crédits
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    bonus INTEGER DEFAULT 0,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insérer les packages de crédits par défaut
INSERT INTO credit_packages (name, credits, price, bonus, is_popular) VALUES
('Starter', 50, 4.99, 0, false),
('Populaire', 150, 12.99, 25, true),
('Pro', 300, 24.99, 75, false),
('Enterprise', 600, 44.99, 200, false)
ON CONFLICT DO NOTHING;

-- 3. Créer la table des achats de crédits
CREATE TABLE IF NOT EXISTS credit_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID NOT NULL REFERENCES credit_packages(id),
    credits INTEGER NOT NULL,
    bonus INTEGER DEFAULT 0,
    total_credits INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ajouter des colonnes aux tâches pour le système de crédits
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_paid_task BOOLEAN DEFAULT true;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creation_cost INTEGER DEFAULT 10;

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creation_paid BOOLEAN DEFAULT false;

-- 5. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment_status ON credit_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_paid_task ON tasks(is_paid_task);
CREATE INDEX IF NOT EXISTS idx_tasks_creation_paid ON tasks(creation_paid);

-- 6. Créer des politiques RLS
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Politiques pour credit_packages (lecture publique)
DROP POLICY IF EXISTS "credit_packages_read" ON credit_packages;
CREATE POLICY "credit_packages_read" ON credit_packages
    FOR SELECT USING (is_active = true);

-- Politiques pour credit_purchases (accès utilisateur)
DROP POLICY IF EXISTS "credit_purchases_user_access" ON credit_purchases;
CREATE POLICY "credit_purchases_user_access" ON credit_purchases
    FOR ALL USING (auth.uid() = user_id);

-- 7. Mettre à jour les tâches existantes
UPDATE tasks 
SET is_paid_task = true,
    creation_paid = true,
    creation_cost = 10
WHERE is_paid_task IS NULL OR creation_paid IS NULL;

-- 8. Créer des commentaires
COMMENT ON TABLE credit_packages IS 'Packages de crédits disponibles à l''achat';
COMMENT ON TABLE credit_purchases IS 'Historique des achats de crédits par les utilisateurs';
COMMENT ON COLUMN tasks.is_paid_task IS 'Indique si la tâche est payante';
COMMENT ON COLUMN tasks.creation_cost IS 'Coût en crédits pour créer cette tâche';
COMMENT ON COLUMN tasks.creation_paid IS 'Indique si le coût de création a été payé';

-- =====================================================
-- Fin du script simplifié
-- =====================================================
