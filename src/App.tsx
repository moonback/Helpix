import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import BottomNavigation from '@/components/navigation/BottomNavigation';

// Lazy loading des pages
const HomePage = React.lazy(() => import('@/features/home/HomePage'));
const MapPage = React.lazy(() => import('@/features/map/MapPage'));
const AddTaskPage = React.lazy(() => import('@/features/add/AddTaskPage'));
const ChatPage = React.lazy(() => import('@/features/chat/ChatPage'));
const WalletPage = React.lazy(() => import('@/features/wallet/WalletPage'));
const ProfilePage = React.lazy(() => import('@/features/profile/ProfilePage'));
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
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Initialiser la messagerie en temps réel si l'utilisateur est connecté
  if (isAuthenticated) {
    useRealtimeMessages();
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Routes publiques */}
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
            <Route path="/" element={
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

            {/* Route par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Navigation bottom */}
        {isAuthenticated && <BottomNavigation />}
      </div>
    </Router>
  );
};

export default App;
