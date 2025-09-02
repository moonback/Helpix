-- =====================================================
-- Script d'implémentation du système de crédits payants
-- =====================================================

-- 1. Ajouter une colonne pour marquer les tâches payantes
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_paid_task BOOLEAN DEFAULT true;

-- 2. Ajouter une colonne pour le coût de création de la tâche
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creation_cost INTEGER DEFAULT 10;

-- 3. Ajouter une colonne pour marquer si la tâche a été payée
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS creation_paid BOOLEAN DEFAULT false;

-- 4. Créer une table pour les packages de crédits
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

-- 5. Insérer les packages de crédits par défaut
INSERT INTO credit_packages (name, credits, price, bonus, is_popular) VALUES
('Starter', 50, 4.99, 0, false),
('Populaire', 150, 12.99, 25, true),
('Pro', 300, 24.99, 75, false),
('Enterprise', 600, 44.99, 200, false)
ON CONFLICT DO NOTHING;

-- 6. Créer une table pour les achats de crédits
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

-- 7. Créer une table pour les coûts de création de tâches
CREATE TABLE IF NOT EXISTS task_creation_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cost INTEGER NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_id UUID REFERENCES transactions(id)
);

-- 8. Ajouter des index pour les performances
CREATE INDEX IF NOT EXISTS idx_tasks_is_paid_task ON tasks(is_paid_task);
CREATE INDEX IF NOT EXISTS idx_tasks_creation_paid ON tasks(creation_paid);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment_status ON credit_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_task_creation_costs_task_id ON task_creation_costs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_creation_costs_user_id ON task_creation_costs(user_id);

-- 9. Créer une fonction pour calculer le coût de création d'une tâche
CREATE OR REPLACE FUNCTION calculate_task_creation_cost(
    p_priority VARCHAR(20),
    p_estimated_duration INTEGER,
    p_budget_credits INTEGER
) RETURNS INTEGER AS $$
DECLARE
    base_cost INTEGER := 10;
    priority_multiplier DECIMAL(3,2) := 1.0;
    duration_multiplier DECIMAL(3,2) := 1.0;
    budget_multiplier DECIMAL(3,2) := 1.0;
BEGIN
    -- Multiplicateur selon la priorité
    CASE p_priority
        WHEN 'urgent' THEN priority_multiplier := 1.5;
        WHEN 'high' THEN priority_multiplier := 1.3;
        WHEN 'medium' THEN priority_multiplier := 1.1;
        WHEN 'low' THEN priority_multiplier := 1.0;
        ELSE priority_multiplier := 1.0;
    END CASE;
    
    -- Multiplicateur selon la durée
    IF p_estimated_duration > 8 THEN
        duration_multiplier := 1.5;
    ELSIF p_estimated_duration > 4 THEN
        duration_multiplier := 1.3;
    ELSIF p_estimated_duration > 2 THEN
        duration_multiplier := 1.1;
    ELSE
        duration_multiplier := 1.0;
    END IF;
    
    -- Multiplicateur selon le budget
    IF p_budget_credits > 100 THEN
        budget_multiplier := 1.3;
    ELSIF p_budget_credits > 50 THEN
        budget_multiplier := 1.1;
    ELSE
        budget_multiplier := 1.0;
    END IF;
    
    -- Calculer le coût final
    RETURN GREATEST(10, FLOOR(base_cost * priority_multiplier * duration_multiplier * budget_multiplier));
END;
$$ LANGUAGE plpgsql;

-- 10. Créer une fonction pour débiter les crédits lors de la création d'une tâche
CREATE OR REPLACE FUNCTION debit_credits_for_task_creation(
    p_user_id UUID,
    p_task_id INTEGER,
    p_cost INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    user_wallet_id UUID;
    current_balance INTEGER;
BEGIN
    -- Récupérer le wallet de l'utilisateur
    SELECT id, balance INTO user_wallet_id, current_balance
    FROM wallets 
    WHERE user_id = p_user_id;
    
    -- Vérifier si l'utilisateur a assez de crédits
    IF current_balance < p_cost THEN
        RETURN FALSE;
    END IF;
    
    -- Débiter les crédits
    UPDATE wallets 
    SET balance = balance - p_cost,
        total_spent = total_spent + p_cost,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Créer une transaction de débit
    INSERT INTO transactions (
        wallet_id,
        type,
        amount,
        description,
        reference_type,
        reference_id,
        status,
        metadata
    ) VALUES (
        user_wallet_id,
        'debit',
        p_cost,
        'Création de tâche',
        'task_creation',
        p_task_id::TEXT,
        'completed',
        jsonb_build_object(
            'task_id', p_task_id,
            'creation_cost', p_cost
        )
    );
    
    -- Marquer la tâche comme payée
    UPDATE tasks 
    SET creation_paid = TRUE,
        creation_cost = p_cost
    WHERE id = p_task_id;
    
    -- Enregistrer le coût de création
    INSERT INTO task_creation_costs (task_id, user_id, cost)
    VALUES (p_task_id, p_user_id, p_cost);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer un trigger pour calculer automatiquement le coût de création
CREATE OR REPLACE FUNCTION trigger_calculate_task_cost()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculer le coût de création
    NEW.creation_cost := calculate_task_creation_cost(
        NEW.priority,
        NEW.estimated_duration,
        NEW.budget_credits
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_task_cost
    BEFORE INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_task_cost();

-- 12. Créer une fonction pour vérifier les crédits avant création de tâche
CREATE OR REPLACE FUNCTION check_credits_before_task_creation(
    p_user_id UUID,
    p_priority VARCHAR(20),
    p_estimated_duration INTEGER,
    p_budget_credits INTEGER
) RETURNS JSONB AS $$
DECLARE
    user_balance INTEGER;
    required_cost INTEGER;
    result JSONB;
BEGIN
    -- Récupérer le solde de l'utilisateur
    SELECT balance INTO user_balance
    FROM wallets 
    WHERE user_id = p_user_id;
    
    -- Calculer le coût requis
    required_cost := calculate_task_creation_cost(
        p_priority,
        p_estimated_duration,
        p_budget_credits
    );
    
    -- Construire la réponse
    result := jsonb_build_object(
        'has_enough_credits', (user_balance >= required_cost),
        'current_balance', COALESCE(user_balance, 0),
        'required_cost', required_cost,
        'missing_credits', GREATEST(0, required_cost - COALESCE(user_balance, 0))
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 13. Créer des politiques RLS pour les nouvelles tables
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_creation_costs ENABLE ROW LEVEL SECURITY;

-- Politiques pour credit_packages (lecture publique)
CREATE POLICY "credit_packages_read" ON credit_packages
    FOR SELECT USING (is_active = true);

-- Politiques pour credit_purchases (accès utilisateur)
CREATE POLICY "credit_purchases_user_access" ON credit_purchases
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour task_creation_costs (accès utilisateur)
CREATE POLICY "task_creation_costs_user_access" ON task_creation_costs
    FOR ALL USING (auth.uid() = user_id);

-- 14. Créer une vue pour les statistiques de crédits
CREATE OR REPLACE VIEW credit_stats AS
SELECT 
    u.id as user_id,
    u.email,
    w.balance,
    w.total_earned,
    w.total_spent,
    COUNT(tc.id) as tasks_created,
    SUM(tc.cost) as total_creation_costs,
    COUNT(cp.id) as purchases_made,
    SUM(cp.total_credits) as total_credits_purchased
FROM auth.users u
LEFT JOIN wallets w ON u.id = w.user_id
LEFT JOIN task_creation_costs tc ON u.id = tc.user_id
LEFT JOIN credit_purchases cp ON u.id = cp.user_id
GROUP BY u.id, u.email, w.balance, w.total_earned, w.total_spent;

-- 15. Créer une fonction pour obtenir les packages de crédits disponibles
CREATE OR REPLACE FUNCTION get_available_credit_packages()
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    credits INTEGER,
    price DECIMAL(10,2),
    bonus INTEGER,
    total_credits INTEGER,
    price_per_credit DECIMAL(10,3),
    is_popular BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.name,
        cp.credits,
        cp.price,
        cp.bonus,
        (cp.credits + cp.bonus) as total_credits,
        ROUND((cp.price::DECIMAL / (cp.credits + cp.bonus)), 3) as price_per_credit,
        cp.is_popular
    FROM credit_packages cp
    WHERE cp.is_active = true
    ORDER BY cp.price ASC;
END;
$$ LANGUAGE plpgsql;

-- 16. Créer une fonction pour traiter un achat de crédits
CREATE OR REPLACE FUNCTION process_credit_purchase(
    p_user_id UUID,
    p_package_id UUID,
    p_payment_method VARCHAR(50),
    p_payment_id VARCHAR(255) DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    package_data RECORD;
    user_wallet_id UUID;
    result JSONB;
BEGIN
    -- Récupérer les données du package
    SELECT * INTO package_data
    FROM credit_packages
    WHERE id = p_package_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Package non trouvé');
    END IF;
    
    -- Récupérer le wallet de l'utilisateur
    SELECT id INTO user_wallet_id
    FROM wallets 
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Wallet non trouvé');
    END IF;
    
    -- Créer l'achat
    INSERT INTO credit_purchases (
        user_id,
        package_id,
        credits,
        bonus,
        total_credits,
        price,
        payment_method,
        payment_status,
        payment_id
    ) VALUES (
        p_user_id,
        p_package_id,
        package_data.credits,
        package_data.bonus,
        (package_data.credits + package_data.bonus),
        package_data.price,
        p_payment_method,
        'completed',
        p_payment_id
    );
    
    -- Créditer le wallet
    UPDATE wallets 
    SET balance = balance + (package_data.credits + package_data.bonus),
        total_earned = total_earned + (package_data.credits + package_data.bonus),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Créer une transaction de crédit
    INSERT INTO transactions (
        wallet_id,
        type,
        amount,
        description,
        reference_type,
        reference_id,
        status,
        metadata
    ) VALUES (
        user_wallet_id,
        'credit',
        (package_data.credits + package_data.bonus),
        'Achat de crédits: ' || package_data.name,
        'credit_purchase',
        p_package_id::TEXT,
        'completed',
        jsonb_build_object(
            'package_name', package_data.name,
            'package_id', p_package_id,
            'credits', package_data.credits,
            'bonus', package_data.bonus,
            'price', package_data.price,
            'payment_method', p_payment_method
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'credits_added', (package_data.credits + package_data.bonus),
        'new_balance', (
            SELECT balance FROM wallets WHERE user_id = p_user_id
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 17. Mettre à jour les tâches existantes pour marquer qu'elles sont payantes
UPDATE tasks 
SET is_paid_task = true,
    creation_paid = true,
    creation_cost = calculate_task_creation_cost(priority, estimated_duration, budget_credits)
WHERE is_paid_task IS NULL OR creation_paid IS NULL;

-- 18. Créer des commentaires pour la documentation
COMMENT ON TABLE credit_packages IS 'Packages de crédits disponibles à l''achat';
COMMENT ON TABLE credit_purchases IS 'Historique des achats de crédits par les utilisateurs';
COMMENT ON TABLE task_creation_costs IS 'Coûts de création des tâches payées';
COMMENT ON COLUMN tasks.is_paid_task IS 'Indique si la tâche est payante (toujours true maintenant)';
COMMENT ON COLUMN tasks.creation_cost IS 'Coût en crédits pour créer cette tâche';
COMMENT ON COLUMN tasks.creation_paid IS 'Indique si le coût de création a été payé';

-- =====================================================
-- Fin du script d'implémentation
-- =====================================================
