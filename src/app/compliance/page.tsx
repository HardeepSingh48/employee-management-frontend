'use client';

import ComplianceReports from '@/components/salary/ComplianceReports';

export default function CompliancePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
        <p className="text-muted-foreground">
          Generate and review statutory compliance reports (PF, ESI, TDS, etc.)
        </p>
      </div>
      
      <ComplianceReports />
    </div>
  );
}
