import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TemplatesPage from './pages/TemplatesPage';
import Builder from './pages/Builder';
import { Loader } from 'lucide-react';

// Wrapper for protecting private routes
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
        <Loader size={36} className="animate-spin text-gray-400" />
        <span className="text-sm text-gray-500 font-medium">Checking authorization...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Wrapper for blocking login/signup when already authenticated
function AuthRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
        <Loader size={36} className="animate-spin text-gray-400" />
        <span className="text-sm text-gray-500 font-medium">Checking authorization...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public / Auth routes */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <Signup />
          </AuthRoute>
        }
      />

      {/* Protected dashboard and builder routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <TemplatesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder/:id"
        element={
          <ProtectedRoute>
            <Builder />
          </ProtectedRoute>
        }
      />

      {/* Catch all redirecting to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
