import React from 'react';
import Card from '../components/ui/Card';

interface ReportsScreenProps {
  projectId: string;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ projectId }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Report</h1>
      <Card className="p-6">
        <p className="text-center text-gray-500">La funzionalità di reportistica è in fase di sviluppo.</p>
      </Card>
    </div>
  );
};

export default ReportsScreen;