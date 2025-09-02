-- Migration minimale pour le système de matching
-- Création des tables essentielles uniquement

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
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_task_id ON recommendations(task_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires_at ON recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_proximity_alerts_user_id ON proximity_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_proximity_alerts_task_id ON proximity_alerts(task_id);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_user_id ON smart_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_smart_notifications_created_at ON smart_notifications(created_at);

-- Politiques RLS (Row Level Security)
ALTER TABLE matching_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE proximity_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour matching_settings
DROP POLICY IF EXISTS "Users can view their own matching settings" ON matching_settings;
CREATE POLICY "Users can view their own matching settings" ON matching_settings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own matching settings" ON matching_settings;
CREATE POLICY "Users can insert their own matching settings" ON matching_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own matching settings" ON matching_settings;
CREATE POLICY "Users can update their own matching settings" ON matching_settings FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour user_stats
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
CREATE POLICY "Users can view their own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own stats" ON user_stats;
CREATE POLICY "Users can insert their own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;
CREATE POLICY "Users can update their own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

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
