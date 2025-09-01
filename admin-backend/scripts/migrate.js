const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  console.log('🚀 Démarrage des migrations...');

  try {
    // Créer la table admin_users
    console.log('📋 Création de la table admin_users...');
    const { error: adminUsersError } = await supabase.rpc('create_admin_users_table');
    if (adminUsersError) {
      console.error('Erreur lors de la création de admin_users:', adminUsersError);
    } else {
      console.log('✅ Table admin_users créée');
    }

    // Créer la table admin_sessions
    console.log('📋 Création de la table admin_sessions...');
    const { error: sessionsError } = await supabase.rpc('create_admin_sessions_table');
    if (sessionsError) {
      console.error('Erreur lors de la création de admin_sessions:', sessionsError);
    } else {
      console.log('✅ Table admin_sessions créée');
    }

    // Créer la table admin_logs
    console.log('📋 Création de la table admin_logs...');
    const { error: logsError } = await supabase.rpc('create_admin_logs_table');
    if (logsError) {
      console.error('Erreur lors de la création de admin_logs:', logsError);
    } else {
      console.log('✅ Table admin_logs créée');
    }

    // Créer la table password_reset_tokens
    console.log('📋 Création de la table password_reset_tokens...');
    const { error: resetTokensError } = await supabase.rpc('create_password_reset_tokens_table');
    if (resetTokensError) {
      console.error('Erreur lors de la création de password_reset_tokens:', resetTokensError);
    } else {
      console.log('✅ Table password_reset_tokens créée');
    }

    // Créer les tables de logs
    console.log('📋 Création des tables de logs...');
    const { error: requestLogsError } = await supabase.rpc('create_request_logs_table');
    if (requestLogsError) {
      console.error('Erreur lors de la création de request_logs:', requestLogsError);
    } else {
      console.log('✅ Table request_logs créée');
    }

    const { error: errorLogsError } = await supabase.rpc('create_error_logs_table');
    if (errorLogsError) {
      console.error('Erreur lors de la création de error_logs:', errorLogsError);
    } else {
      console.log('✅ Table error_logs créée');
    }

    const { error: performanceLogsError } = await supabase.rpc('create_performance_logs_table');
    if (performanceLogsError) {
      console.error('Erreur lors de la création de performance_logs:', performanceLogsError);
    } else {
      console.log('✅ Table performance_logs créée');
    }

    const { error: securityLogsError } = await supabase.rpc('create_security_logs_table');
    if (securityLogsError) {
      console.error('Erreur lors de la création de security_logs:', securityLogsError);
    } else {
      console.log('✅ Table security_logs créée');
    }

    console.log('🎉 Migrations terminées avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
}

// Exécuter les migrations si ce script est appelé directement
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
