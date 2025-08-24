"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddSiteForm from '@/features/admin/components/sites/AddSiteForm';
import BulkImport from '@/features/admin/components/sites/BulkImport';
import SitesList from '@/features/admin/components/sites/SitesList';

export default function SitesPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'bulk' | 'list'>('add');

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sites Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'add'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('add')}
            >
              Add Site
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('bulk')}
            >
              Bulk Import
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('list')}
            >
              Sites List
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'add' && <AddSiteForm />}
            {activeTab === 'bulk' && <BulkImport />}
            {activeTab === 'list' && <SitesList />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}