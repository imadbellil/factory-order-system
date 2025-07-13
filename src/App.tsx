import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Login } from './pages/Login';
import { RouibaDashboard } from './pages/RouibaDashboard';
import { MeftahDashboard } from './pages/MeftahDashboard';
import { HangarDashboard } from './pages/HangarDashboard';
import { onForegroundMessage } from './services/notifications';

function App() {
  const { user, loading } = useAuth();
  const [toast, setToast] = React.useState<{ title: string; body: string } | null>(null);

  React.useEffect(() => {
    const unsub = onForegroundMessage((payload: any) => {
      if (payload?.notification) {
        setToast({ title: payload.notification.title, body: payload.notification.body });
        setTimeout(() => setToast(null), 5000);
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

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
    <>
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg flex flex-col items-center animate-fade-in">
          <strong>{toast.title}</strong>
          <span>{toast.body}</span>
        </div>
      )}
      <Router>
        <Routes>
          <Route path="/" element={getDashboard()} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;