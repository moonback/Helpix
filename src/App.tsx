import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import CreditsDisplayWithPurchase from '@/components/ui/CreditsDisplayWithPurchase';
import PaymentNotificationContainer from '@/components/ui/PaymentNotificationContainer';

// Lazy loading des pages
const LandingPage = React.lazy(() => import('@/features/landing/LandingPage'));
const HomePage = React.lazy(() => import('@/features/home/HomePage'));
const MapPage = React.lazy(() => import('@/features/map/MapPage'));
const AddTaskPage = React.lazy(() => import('@/features/add/AddTaskPage'));
const ChatPage = React.lazy(() => import('@/features/chat/ChatPage'));
const WalletPage = React.lazy(() => import('@/features/wallet/WalletPage'));
const ProfilePage = React.lazy(() => import('@/features/profile/ProfilePage'));
const DashboardPage = React.lazy(() => import('@/features/dashboard/DashboardPage'));
const TaskDetailPage = React.lazy(() => import('@/features/task-detail/TaskDetailPage'));
const EditTaskPage = React.lazy(() => import('@/features/edit/EditTaskPage'));
const HelpOffersPage = React.lazy(() => import('@/features/help-offers/HelpOffersPage'));
const Auth = React.lazy(() => import('@/features/auth/Auth'));
const Onboarding = React.lazy(() => import('@/features/auth/Onboarding'));

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Initialiser la messagerie en temps réel (le hook gère lui-même l'état d'authentification)
  useRealtimeMessages();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Landing page pour les non-connectés */}
            <Route path="/" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            <Route path="/landing" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            
            {/* Routes publiques */}
            <Route path="/login" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/auth" element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } />
            <Route path="/onboarding" element={
              <PublicRoute>
                <Onboarding />
              </PublicRoute>
            } />

            {/* Routes protégées */}
            <Route path="/home" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <HomePage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <MapPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/add" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <AddTaskPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/create-task" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <AddTaskPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <ChatPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <WalletPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <ProfilePage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <DashboardPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/task/:taskId" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <TaskDetailPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/edit-task/:taskId" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <EditTaskPage />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/task/:taskId/offers" element={
              <ProtectedRoute>
                <div className="pb-16">
                  <HelpOffersPage />
                </div>
              </ProtectedRoute>
            } />

            {/* Route par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Navigation bottom */}
        {isAuthenticated && <BottomNavigation />}

        {/* Bouton flottant d'achat de crédits - accessible sur toutes les pages */}
        {isAuthenticated && (
          <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-[100]">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              <CreditsDisplayWithPurchase 
                showPurchaseButton={true}
                variant="floating"
                className=""
              />
            </motion.div>
          </div>
        )}

        {/* Notifications de paiement */}
        {isAuthenticated && <PaymentNotificationContainer />}
      </div>
    </Router>
  );
};

export default App;
