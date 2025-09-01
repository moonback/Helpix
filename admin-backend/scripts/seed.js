const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDatabase() {
  console.log('🌱 Démarrage du seeding...');

  try {
    // Créer l'admin par défaut
    console.log('👤 Création de l\'admin par défaut...');
    
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
    
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        email: process.env.ADMIN_EMAIL || 'admin@entraide-universelle.com',
        name: 'Administrateur Principal',
        password_hash: hashedPassword,
        role: 'super_admin',
        permissions: [
          'view_users', 'edit_users', 'delete_users', 'ban_users',
          'view_tasks', 'edit_tasks', 'delete_tasks', 'moderate_tasks',
          'view_transactions', 'process_withdrawals', 'manage_credits',
          'view_analytics', 'export_data',
          'manage_settings', 'view_logs', 'manage_notifications'
        ],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (adminError) {
      if (adminError.code === '23505') {
        console.log('ℹ️  Admin par défaut existe déjà');
      } else {
        console.error('Erreur lors de la création de l\'admin:', adminError);
      }
    } else {
      console.log('✅ Admin par défaut créé:', admin.email);
    }

    // Créer des admins de test
    console.log('👥 Création des admins de test...');
    
    const testAdmins = [
      {
        email: 'moderator@entraide-universelle.com',
        name: 'Modérateur',
        role: 'moderator',
        permissions: ['view_users', 'view_tasks', 'moderate_tasks', 'view_analytics']
      },
      {
        email: 'support@entraide-universelle.com',
        name: 'Support',
        role: 'support',
        permissions: ['view_users', 'view_tasks', 'view_analytics']
      },
      {
        email: 'analyst@entraide-universelle.com',
        name: 'Analyste',
        role: 'analyst',
        permissions: ['view_analytics', 'export_data']
      }
    ];

    for (const adminData of testAdmins) {
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', adminData.email)
        .single();

      if (!existingAdmin) {
        const { error } = await supabase
          .from('admin_users')
          .insert({
            ...adminData,
            password_hash: hashedPassword,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error(`Erreur lors de la création de ${adminData.email}:`, error);
        } else {
          console.log(`✅ Admin créé: ${adminData.email}`);
        }
      } else {
        console.log(`ℹ️  Admin existe déjà: ${adminData.email}`);
      }
    }

    // Créer des catégories de tâches par défaut
    console.log('📋 Création des catégories de tâches...');
    
    const categories = [
      { name: 'Ménage', description: 'Tâches de nettoyage et d\'entretien', icon: '🧹', color: '#3B82F6' },
      { name: 'Jardinage', description: 'Tâches de jardin et d\'extérieur', icon: '🌱', color: '#10B981' },
      { name: 'Bricolage', description: 'Tâches de réparation et construction', icon: '🔨', color: '#F59E0B' },
      { name: 'Transport', description: 'Services de transport et livraison', icon: '🚗', color: '#8B5CF6' },
      { name: 'Autre', description: 'Autres types de tâches', icon: '📋', color: '#6B7280' }
    ];

    for (const category of categories) {
      const { data: existingCategory } = await supabase
        .from('task_categories')
        .select('id')
        .eq('name', category.name)
        .single();

      if (!existingCategory) {
        const { error } = await supabase
          .from('task_categories')
          .insert({
            ...category,
            is_active: true,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error(`Erreur lors de la création de la catégorie ${category.name}:`, error);
        } else {
          console.log(`✅ Catégorie créée: ${category.name}`);
        }
      } else {
        console.log(`ℹ️  Catégorie existe déjà: ${category.name}`);
      }
    }

    console.log('🎉 Seeding terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

// Exécuter le seeding si ce script est appelé directement
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
