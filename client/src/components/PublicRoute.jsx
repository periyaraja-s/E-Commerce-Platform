import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
