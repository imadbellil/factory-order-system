import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Login } from './pages/Login';
import { RouibaDashboard } from './pages/RouibaDashboard';
import { MeftahDashboard } from './pages/MeftahDashboard';
import { HangarDashboard } from './pages/HangarDashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  const getDashboard = () => {
    switch (user.role) {
      case 'rouiba':
        return <RouibaDashboard user={user} />;
      case 'meftah':
        return <MeftahDashboard user={user} />;
      case 'hangar':
        return <HangarDashboard user={user} />;
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600">Rôle utilisateur non reconnu</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={getDashboard()} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;