import nodemailer from 'nodemailer';

export const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  from: process.env.EMAIL_FROM || 'noreply@entraide-universelle.com'
};

if (!emailConfig.auth.user || !emailConfig.auth.pass) {
  console.warn('Configuration email manquante. Les emails ne pourront pas être envoyés.');
}

// Créer le transporteur email
export const emailTransporter = nodemailer.createTransporter({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth
});

// Vérifier la configuration email
emailTransporter.verify((error, success) => {
  if (error) {
    console.error('Erreur de configuration email:', error);
  } else {
    console.log('Configuration email validée');
  }
});

// Templates d'emails
export const emailTemplates = {
  welcome: {
    subject: 'Bienvenue sur Entraide Universelle',
    template: 'welcome'
  },
  passwordReset: {
    subject: 'Réinitialisation de votre mot de passe',
    template: 'password-reset'
  },
  userSuspended: {
    subject: 'Votre compte a été suspendu',
    template: 'user-suspended'
  },
  taskAssigned: {
    subject: 'Nouvelle tâche assignée',
    template: 'task-assigned'
  },
  taskCompleted: {
    subject: 'Tâche terminée',
    template: 'task-completed'
  },
  withdrawalApproved: {
    subject: 'Retrait approuvé',
    template: 'withdrawal-approved'
  },
  withdrawalRejected: {
    subject: 'Retrait rejeté',
    template: 'withdrawal-rejected'
  },
  adminNotification: {
    subject: 'Notification administrateur',
    template: 'admin-notification'
  }
};

// Configuration des notifications
export const notificationConfig = {
  email: {
    enabled: true,
    batchSize: 100,
    delay: 1000 // 1 seconde entre les envois
  },
  push: {
    enabled: false, // À implémenter avec Firebase
    batchSize: 1000
  },
  sms: {
    enabled: false, // À implémenter avec Twilio
    batchSize: 50
  }
};
