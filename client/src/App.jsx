import React from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function Home() {
  const { user, logout } = useAuth();
  return <main style={{ maxWidth: 900, margin: '80px auto', padding: 24, fontFamily: 'system-ui' }}>
    <h1>E-Commerce Platform</h1>
    <p>Welcome, {user.name}.</p>
    <p>Role: <strong>{user.role}</strong></p>
    <button onClick={logout}>Logout</button>
  </main>;
}

function AppRoutes() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<Home />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
