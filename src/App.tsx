import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

// Pages
import Onboarding from '@/features/auth/Onboarding';
import Auth from '@/features/auth/Auth';
import HomePage from '@/features/home/HomePage';
import MapPage from '@/features/map/MapPage';
import AddTaskPage from '@/features/add/AddTaskPage';
import WalletPage from '@/features/wallet/WalletPage';
import ProfilePage from '@/features/profile/ProfilePage';
import ChatPage from '@/features/chat/ChatPage';

// Components
import BottomNavigation from '@/components/navigation/BottomNavigation';

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <div className="text-6xl mb-4">🤝</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Entraide Universelle
      </h1>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
    </motion.div>
  </div>
);

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Public route component (redirects if already authenticated)
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
  // Utiliser le hook useAuth pour la gestion automatique de l'authentification
  useAuth();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public routes */}
            <Route
              path="/onboarding"
              element={
                <PublicRoute>
                  <Onboarding />
                </PublicRoute>
              }
            />
            
            <Route
              path="/auth"
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                  <BottomNavigation />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapPage />
                  <BottomNavigation />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddTaskPage />
                  <BottomNavigation />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                  <BottomNavigation />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                  <BottomNavigation />
                </ProtectedRoute>
              }
            />

            {/* Chat route */}
            <Route
              path="/chat/:userId"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>


      </div>
    </Router>
  );
};

export default App;
