-- Migration 001: Création des tables admin
-- Date: 2023-12-01
-- Description: Création des tables pour le système d'administration

-- Table des utilisateurs admin
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'support', 'analyst')),
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des sessions admin
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des logs d'actions admin
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des tokens de réinitialisation de mot de passe
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des logs de requêtes
CREATE TABLE IF NOT EXISTS request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    response_size INTEGER,
    ip_address INET,
    user_agent TEXT,
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    user_id UUID,
    request_body JSONB,
    query_params JSONB,
    path_params JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des logs d'erreurs
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    stack TEXT,
    method VARCHAR(10),
    url TEXT,
    ip_address INET,
    user_agent TEXT,
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des logs de performance
CREATE TABLE IF NOT EXISTS performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    method VARCHAR(10) NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status_code INTEGER NOT NULL,
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des logs de sécurité
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    method VARCHAR(10),
    url TEXT,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table des catégories de tâches
CREATE TABLE IF NOT EXISTS task_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    color VARCHAR(7),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_admin_id ON password_reset_tokens(admin_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON request_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_request_logs_admin_id ON request_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_status_code ON request_logs(status_code);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_admin_id ON error_logs(admin_id);

CREATE INDEX IF NOT EXISTS idx_performance_logs_created_at ON performance_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_logs_duration ON performance_logs(duration);

CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(type);

CREATE INDEX IF NOT EXISTS idx_task_categories_name ON task_categories(name);
CREATE INDEX IF NOT EXISTS idx_task_categories_active ON task_categories(is_active);

-- Triggers pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_sessions_updated_at BEFORE UPDATE ON admin_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Désactivé pour l'admin backend
-- Les politiques RLS seront gérées au niveau application

-- Commentaires sur les tables
COMMENT ON TABLE admin_users IS 'Utilisateurs administrateurs du système';
COMMENT ON TABLE admin_sessions IS 'Sessions actives des administrateurs';
COMMENT ON TABLE admin_logs IS 'Logs des actions des administrateurs';
COMMENT ON TABLE password_reset_tokens IS 'Tokens de réinitialisation de mot de passe';
COMMENT ON TABLE request_logs IS 'Logs des requêtes HTTP';
COMMENT ON TABLE error_logs IS 'Logs des erreurs applicatives';
COMMENT ON TABLE performance_logs IS 'Logs de performance';
COMMENT ON TABLE security_logs IS 'Logs de sécurité';
COMMENT ON TABLE task_categories IS 'Catégories de tâches';
