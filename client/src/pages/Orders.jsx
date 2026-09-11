import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AdminOrderManagement from '../components/AdminOrderManagement.jsx';
import CustomerOrdersView from '../components/CustomerOrdersView.jsx';

export default function Orders() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {isAdmin ? <AdminOrderManagement /> : <CustomerOrdersView />}
    </div>
  );
}

