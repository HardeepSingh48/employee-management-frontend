'use client'

import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import IndividualTab from './components/IndividualTab';
import BulkTab from './components/BulkTab';

export default function IDCardsPage() {
  const [activeTab, setActiveTab] = useState('individual');

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">ID Cards</h1>
        <p className="text-sm text-muted-foreground">Generate employee ID cards and download PDFs.</p>
      </div>

      <Card className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="bulk">Bulk</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="mt-4">
            <IndividualTab />
          </TabsContent>
          <TabsContent value="bulk" className="mt-4">
            <BulkTab />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}


