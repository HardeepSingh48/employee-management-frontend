import React from 'react';
import SitesPage from '@/features/admin/components/sites/SitesPage';
import { Logo } from '@/components/layout/Logo';

export default function Sites() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <Logo width={40} height={40} />
          <h1 className="text-2xl font-bold text-gray-900">Sites Management</h1>
        </div>
      </div>
      <SitesPage />
    </div>
  );
}