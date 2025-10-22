import React, { useState, useEffect, lazy, Suspense } from 'react';
import { DollarSign, Building, AlertTriangle, CheckCircle, Settings } from 'lucide-react';
import Card from '@/components/ui/Card';
import * as dataService from '@/services/dataService';
import { Deadline, Property, Screen } from '@/types';
import { availableDashboardWidgets } from '@/components/dashboard/widgets';

const CustomizeDashboardModal = lazy(() => import('@/components/modals/CustomizeDashboardModal'));


interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => (
  <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
    <Card className="p-4 h-full">
      <div className="flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-dark">{value}</p>
        </div>
      </div>
    </Card>
  </div>
);

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void;
  projectId: string;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate, projectId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isCustomizeModalOpen, setCustomizeModalOpen] = useState(false);
  
  const [activeWidgets, setActiveWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboardWidgets');
    return saved ? JSON.parse(saved) : ['upcomingDeadlines', 'recentExpenses'];
  });

  useEffect(() => {
    setProperties(dataService.getProperties(projectId));
    setDeadlines(dataService.getDeadlines(projectId)); 
  }, [projectId]);

  const totalRent = properties.reduce((acc, p) => acc + (p.isRented && p.rentAmount ? p.rentAmount : 0), 0);
  const occupancyRate = properties.length > 0 ? (properties.filter(p => p.isRented).length / properties.length) * 100 : 0;
  const upcomingDeadlinesCount = deadlines.filter(d => !d.isCompleted && new Date(d.dueDate) >= new Date()).length;
  
  const handleSaveWidgets = (selectedWidgets: string[]) => {
    setActiveWidgets(selectedWidgets);
    localStorage.setItem('dashboardWidgets', JSON.stringify(selectedWidgets));
    setCustomizeModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Dashboard</h1>
        <button
          onClick={() => setCustomizeModalOpen(true)}
          className="flex items-center px-3 py-2 bg-white text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-sm border"
        >
          <Settings size={16} className="mr-2" />
          Personalizza
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Entrate Mensili Stimate" value={`€ ${totalRent.toLocaleString('it-IT')}`} icon={<DollarSign className="text-white"/>} color="bg-green-500" onClick={() => onNavigate('payments')} />
        <StatCard title="Immobili Occupati" value={`${occupancyRate.toFixed(0)}%`} icon={<Building className="text-white"/>} color="bg-blue-500" onClick={() => onNavigate('properties')} />
        <StatCard title="Scadenze Prossime" value={upcomingDeadlinesCount} icon={<AlertTriangle className="text-white"/>} color="bg-yellow-500" onClick={() => onNavigate('deadlines')} />
        <StatCard title="Task Completati" value={deadlines.filter(d => d.isCompleted).length} icon={<CheckCircle className="text-white"/>} color="bg-indigo-500" onClick={() => onNavigate('deadlines')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeWidgets.map(widgetId => {
            const widget = availableDashboardWidgets.find(w => w.id === widgetId);
            if (!widget) return null;
            const WidgetComponent = widget.component;
            return <WidgetComponent key={widgetId} projectId={projectId} />;
        })}
      </div>
      
      <Suspense fallback={null}>
        <CustomizeDashboardModal
          isOpen={isCustomizeModalOpen}
          onClose={() => setCustomizeModalOpen(false)}
          onSave={handleSaveWidgets}
          currentWidgets={activeWidgets}
        />
      </Suspense>
    </div>
  );
};

export default DashboardScreen;
