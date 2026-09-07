import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AdminDashboardView from '../components/AdminDashboardView.jsx';
import CustomerDashboardView from '../components/CustomerDashboardView.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboardView user={user} />;
  }

  return <CustomerDashboardView user={user} />;
}
