-- Migration pour le système de matching intelligent
-- Création des tables nécessaires au système de matching

-- Table des compétences utilisateur
CREATE TABLE IF NOT EXISTS user_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'home_improvement', 'technology', 'gardening', 'cooking', 'transportation',
        'education', 'healthcare', 'business', 'art', 'sports', 'language',
        'maintenance', 'cleaning', 'organization', 'communication', 'other'
    )),
    proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    verified BOOLEAN DEFAULT FALSE,
    experience_years INTEGER,
    certifications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des certifications utilisateur
CREATE TABLE IF NOT EXISTS user_certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des badges utilisateur
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT NOT NULL CHECK (category IN ('achievement', 'skill', 'community', 'special')),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

-- Table des paramètres de matching
CREATE TABLE IF NOT EXISTS matching_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_matching_enabled BOOLEAN DEFAULT TRUE,
    max_daily_recommendations INTEGER DEFAULT 10,
    min_compatibility_score DECIMAL(3,2) DEFAULT 0.40,
    max_distance_km INTEGER DEFAULT 10,
    preferred_categories TEXT[],
    blacklisted_categories TEXT[],
    notification_frequency TEXT DEFAULT 'hourly' CHECK (notification_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    learning_mode BOOLEAN DEFAULT TRUE,
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table des recommandations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('proximity', 'skill_match', 'urgency', 'history', 'budget')),
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    reason TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_viewed BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE
);

-- Table des alertes de proximité
CREATE TABLE IF NOT EXISTS proximity_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    distance_km DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_sent BOOLEAN DEFAULT FALSE,
    is_viewed BOOLEAN DEFAULT FALSE
);

-- Table des notifications intelligentes
CREATE TABLE IF NOT EXISTS smart_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('task_match', 'proximity_alert', 'skill_opportunity', 'deadline_reminder')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT
);

-- Table de l'historique de matching
CREATE TABLE IF NOT EXISTS matching_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('viewed', 'applied', 'accepted', 'rejected', 'completed')),
    compatibility_score DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Table des statistiques utilisateur
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_tasks_completed INTEGER DEFAULT 0,
    total_tasks_created INTEGER DEFAULT 0,
    total_hours_volunteered DECIMAL(8,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    response_time_minutes INTEGER DEFAULT 60,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    reliability_score DECIMAL(5,2) DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Ajout des colonnes manquantes à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
    "max_distance_km": 10,
    "preferred_categories": [],
    "preferred_time_slots": [],
    "min_task_budget": 0,
    "notification_settings": {
        "proximity_alerts": true,
        "skill_matches": true,
        "urgent_tasks": true,
        "new_messages": true,
        "task_updates": true,
        "email_notifications": true,
        "push_notifications": true
    },
    "language_preference": "fr",
    "communication_style": "friendly"
}',
ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{
    "is_available": true,
    "next_available": null,
    "current_status": "available",
    "auto_accept_radius": 5,
    "auto_accept_categories": []
}',
ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS trust_level TEXT DEFAULT 'new' CHECK (trust_level IN ('new', 'verified', 'trusted', 'expert'));

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_category ON user_skills(category);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_task_id ON recommendations(task_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires_at ON recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_proximity_alerts_user_id ON proximity_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_proximity_alerts_task_id ON proximity_alerts(task_id);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_user_id ON smart_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_created_at ON smart_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_matching_history_user_id ON matching_history(user_id);
CREATE INDEX IF NOT EXISTS idx_matching_history_task_id ON matching_history(task_id);
CREATE INDEX IF NOT EXISTS idx_matching_history_timestamp ON matching_history(timestamp);

-- Fonctions pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour les timestamps
DROP TRIGGER IF EXISTS update_user_skills_updated_at ON user_skills;
CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_certifications_updated_at ON user_certifications;
CREATE TRIGGER update_user_certifications_updated_at BEFORE UPDATE ON user_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matching_settings_updated_at ON matching_settings;
CREATE TRIGGER update_matching_settings_updated_at BEFORE UPDATE ON matching_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer automatiquement les statistiques utilisateur
CREATE OR REPLACE FUNCTION calculate_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_completed_tasks INTEGER;
    v_created_tasks INTEGER;
    v_total_hours DECIMAL(8,2);
    v_avg_rating DECIMAL(3,2);
    v_completion_rate DECIMAL(5,2);
    v_reliability_score DECIMAL(5,2);
BEGIN
    -- Calculer les tâches complétées
    SELECT COUNT(*) INTO v_completed_tasks
    FROM tasks 
    WHERE assigned_to = p_user_id AND status = 'completed';
    
    -- Calculer les tâches créées
    SELECT COUNT(*) INTO v_created_tasks
    FROM tasks 
    WHERE user_id = p_user_id;
    
    -- Calculer le total d'heures
    SELECT COALESCE(SUM(actual_duration), 0) INTO v_total_hours
    FROM tasks 
    WHERE assigned_to = p_user_id AND status = 'completed';
    
    -- Calculer la note moyenne
    SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating
    FROM tasks 
    WHERE assigned_to = p_user_id AND status = 'completed' AND rating IS NOT NULL;
    
    -- Calculer le taux de completion
    IF v_created_tasks > 0 THEN
        v_completion_rate := (v_completed_tasks::DECIMAL / v_created_tasks::DECIMAL) * 100;
    ELSE
        v_completion_rate := 0;
    END IF;
    
    -- Calculer le score de fiabilité (basé sur la note moyenne et le taux de completion)
    v_reliability_score := (v_avg_rating * 20) + (v_completion_rate * 0.6);
    
    -- Mettre à jour ou insérer les statistiques
    INSERT INTO user_stats (
        user_id, 
        total_tasks_completed, 
        total_tasks_created, 
        total_hours_volunteered, 
        average_rating, 
        completion_rate, 
        reliability_score
    ) VALUES (
        p_user_id, 
        v_completed_tasks, 
        v_created_tasks, 
        v_total_hours, 
        v_avg_rating, 
        v_completion_rate, 
        v_reliability_score
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_tasks_completed = EXCLUDED.total_tasks_completed,
        total_tasks_created = EXCLUDED.total_tasks_created,
        total_hours_volunteered = EXCLUDED.total_hours_volunteered,
        average_rating = EXCLUDED.average_rating,
        completion_rate = EXCLUDED.completion_rate,
        reliability_score = EXCLUDED.reliability_score,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les recommandations expirées
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS VOID AS $$
BEGIN
    DELETE FROM recommendations WHERE expires_at < NOW();
    DELETE FROM smart_notifications WHERE expires_at < NOW() AND expires_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer des recommandations automatiques
CREATE OR REPLACE FUNCTION generate_automatic_recommendations()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    task_record RECORD;
    compatibility_score DECIMAL(5,2);
    recommendation_type TEXT;
    recommendation_reason TEXT;
BEGIN
    -- Parcourir tous les utilisateurs avec le matching automatique activé
    FOR user_record IN 
        SELECT u.id, u.latitude, u.longitude, ms.max_daily_recommendations, ms.min_compatibility_score
        FROM users u
        JOIN matching_settings ms ON u.id = ms.user_id
        WHERE ms.auto_matching_enabled = TRUE
        AND u.availability->>'is_available' = 'true'
    LOOP
        -- Parcourir les tâches disponibles
        FOR task_record IN
            SELECT t.id, t.title, t.required_skills, t.budget_credits, t.latitude, t.longitude, t.priority
            FROM tasks t
            WHERE t.status = 'open'
            AND t.user_id != user_record.id
            AND t.id NOT IN (
                SELECT task_id FROM recommendations 
                WHERE user_id = user_record.id 
                AND expires_at > NOW()
                AND is_dismissed = FALSE
            )
        LOOP
            -- Calculer le score de compatibilité (simplifié)
            compatibility_score := 50; -- Score de base
            
            -- Bonus pour la proximité
            IF user_record.latitude IS NOT NULL AND user_record.longitude IS NOT NULL 
               AND task_record.latitude IS NOT NULL AND task_record.longitude IS NOT NULL THEN
                -- Calculer la distance (simplifié)
                compatibility_score := compatibility_score + 20;
            END IF;
            
            -- Bonus pour l'urgence
            IF task_record.priority = 'urgent' THEN
                compatibility_score := compatibility_score + 15;
            ELSIF task_record.priority = 'high' THEN
                compatibility_score := compatibility_score + 10;
            END IF;
            
            -- Vérifier si le score est suffisant
            IF compatibility_score >= user_record.min_compatibility_score THEN
                -- Déterminer le type de recommandation
                IF compatibility_score >= 80 THEN
                    recommendation_type := 'skill_match';
                    recommendation_reason := 'Excellente correspondance avec vos compétences';
                ELSIF compatibility_score >= 70 THEN
                    recommendation_type := 'proximity';
                    recommendation_reason := 'Tâche à proximité de votre localisation';
                ELSE
                    recommendation_type := 'budget';
                    recommendation_reason := 'Opportunité intéressante dans votre budget';
                END IF;
                
                -- Insérer la recommandation
                INSERT INTO recommendations (
                    user_id, 
                    task_id, 
                    type, 
                    score, 
                    reason, 
                    priority,
                    expires_at
                ) VALUES (
                    user_record.id,
                    task_record.id,
                    recommendation_type,
                    compatibility_score,
                    recommendation_reason,
                    CASE 
                        WHEN compatibility_score >= 80 THEN 'high'
                        WHEN compatibility_score >= 60 THEN 'medium'
                        ELSE 'low'
                    END,
                    NOW() + INTERVAL '24 hours'
                );
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Politiques RLS (Row Level Security)
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE proximity_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_skills
DROP POLICY IF EXISTS "Users can view their own skills" ON user_skills;
CREATE POLICY "Users can view their own skills" ON user_skills FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own skills" ON user_skills;
CREATE POLICY "Users can insert their own skills" ON user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own skills" ON user_skills;
CREATE POLICY "Users can update their own skills" ON user_skills FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own skills" ON user_skills;
CREATE POLICY "Users can delete their own skills" ON user_skills FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour user_certifications
DROP POLICY IF EXISTS "Users can view their own certifications" ON user_certifications;
CREATE POLICY "Users can view their own certifications" ON user_certifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own certifications" ON user_certifications;
CREATE POLICY "Users can insert their own certifications" ON user_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own certifications" ON user_certifications;
CREATE POLICY "Users can update their own certifications" ON user_certifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own certifications" ON user_certifications;
CREATE POLICY "Users can delete their own certifications" ON user_certifications FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour user_badges
DROP POLICY IF EXISTS "Users can view their own badges" ON user_badges;
CREATE POLICY "Users can view their own badges" ON user_badges FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own badges" ON user_badges;
CREATE POLICY "Users can insert their own badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour matching_settings
DROP POLICY IF EXISTS "Users can view their own matching settings" ON matching_settings;
CREATE POLICY "Users can view their own matching settings" ON matching_settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own matching settings" ON matching_settings;
CREATE POLICY "Users can insert their own matching settings" ON matching_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own matching settings" ON matching_settings;
CREATE POLICY "Users can update their own matching settings" ON matching_settings FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour recommendations
DROP POLICY IF EXISTS "Users can view their own recommendations" ON recommendations;
CREATE POLICY "Users can view their own recommendations" ON recommendations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own recommendations" ON recommendations;
CREATE POLICY "Users can insert their own recommendations" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own recommendations" ON recommendations;
CREATE POLICY "Users can update their own recommendations" ON recommendations FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour proximity_alerts
DROP POLICY IF EXISTS "Users can view their own proximity alerts" ON proximity_alerts;
CREATE POLICY "Users can view their own proximity alerts" ON proximity_alerts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own proximity alerts" ON proximity_alerts;
CREATE POLICY "Users can insert their own proximity alerts" ON proximity_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own proximity alerts" ON proximity_alerts;
CREATE POLICY "Users can update their own proximity alerts" ON proximity_alerts FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour smart_notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON smart_notifications;
CREATE POLICY "Users can view their own notifications" ON smart_notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON smart_notifications;
CREATE POLICY "Users can insert their own notifications" ON smart_notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON smart_notifications;
CREATE POLICY "Users can update their own notifications" ON smart_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour matching_history
DROP POLICY IF EXISTS "Users can view their own matching history" ON matching_history;
CREATE POLICY "Users can view their own matching history" ON matching_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own matching history" ON matching_history;
CREATE POLICY "Users can insert their own matching history" ON matching_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques pour user_stats
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
CREATE POLICY "Users can view their own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stats" ON user_stats;
CREATE POLICY "Users can insert their own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;
CREATE POLICY "Users can update their own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Commentaires sur les tables
COMMENT ON TABLE user_skills IS 'Compétences et expertise des utilisateurs';
COMMENT ON TABLE user_certifications IS 'Certifications et diplômes des utilisateurs';
COMMENT ON TABLE user_badges IS 'Badges et récompenses des utilisateurs';
COMMENT ON TABLE matching_settings IS 'Paramètres de matching personnalisés';
COMMENT ON TABLE recommendations IS 'Recommandations de tâches générées par l''algorithme';
COMMENT ON TABLE proximity_alerts IS 'Alertes de proximité pour les tâches à proximité';
COMMENT ON TABLE smart_notifications IS 'Notifications intelligentes du système';
COMMENT ON TABLE matching_history IS 'Historique des interactions de matching';
COMMENT ON TABLE user_stats IS 'Statistiques et métriques des utilisateurs';
