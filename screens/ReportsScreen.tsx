
import React from 'react';
import Card from '../components/ui/Card';

const ReportsScreen: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-6">Report e Analisi</h1>
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg">La sezione Report è in fase di sviluppo.</p>
          <p>Torna presto per visualizzare analisi dettagliate sulle tue proprietà!</p>
        </div>
      </Card>
    </div>
  );
};

export default ReportsScreen;
