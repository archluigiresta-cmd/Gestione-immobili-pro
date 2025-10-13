import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Deadline, DeadlineType, User, Property } from '../types';
import { PlusCircle, Edit, Trash2, CheckCircle, List, CalendarDays, ChevronDown } from 'lucide-react';
import AddDeadlineModal from '../components/modals/AddDeadlineModal';
import EditDeadlineModal from '../components/modals/EditDeadlineModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';

interface DeadlinesScreenProps {
  projectId: string;
  user: User;
}

const getPropertyColors = (index: number) => {
    const colors = [
        'border-purple-500', 'border-pink-500', 'border-yellow-500', 'border-red-500',
        'border-teal-500', 'border-blue-500', 'border-green-500', 'border-indigo-500'
    ];
    return colors[index % colors.length];
};

const getDeadlineTypePillStyle = (type: DeadlineType) => {
    switch (type) {
        case DeadlineType.RENT: return 'bg-blue-500 text-white';
        case DeadlineType.TAX: return 'bg-red-500 text-white';
        case DeadlineType.MAINTENANCE: return 'bg-yellow-500 text-white';
        case DeadlineType.CONTRACT: return 'bg-purple-500 text-white';
        case DeadlineType.DOCUMENT: return 'bg-teal-500 text-white';
        default: return 'bg-gray-500 text-white';
    }
};

const CalendarView: React.FC<{ deadlines: Deadline[], onEdit: (d: Deadline) => void }> = ({ deadlines, onEdit }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
    
    const { monthGrid, monthName, year } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0=Mon, 6=Sun

        const monthGrid = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            monthGrid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            monthGrid.push(new Date(year, month, i));
        }

        return {
            monthGrid,
            monthName: currentDate.toLocaleString('it-IT', { month: 'long' }),
            year: year
        };
    }, [currentDate]);

    const deadlinesByDate = useMemo(() => {
        const map = new Map<string, Deadline[]>();
        deadlines.forEach(d => {
            const dateStr = d.dueDate;
            if (!map.has(dateStr)) {
                map.set(dateStr, []);
            }
            map.get(dateStr)?.push(d);
        });
        return map;
    }, [deadlines]);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const today = new Date();
    today.setHours(0,0,0,0);

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                <h3 className="text-lg font-bold text-dark capitalize">{monthName} {year}</h3>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500">
                {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((day, index) => {
                    if (!day) return <div key={`empty-${index}`} className="border rounded-md"></div>;
                    const dayStr = day.toISOString().split('T')[0];
                    const dayDeadlines = deadlinesByDate.get(dayStr) || [];
                    const isToday = day.getTime() === today.getTime();
                    
                    return (
                        <div key={dayStr} className={`border rounded-md p-1.5 min-h-[120px] ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                            <span className={`flex items-center justify-center h-6 w-6 rounded-full text-sm font-semibold ${isToday ? 'bg-primary text-white' : ''}`}>
                                {day.getDate()}
                            </span>
                            <div className="mt-1 space-y-1">
                                {dayDeadlines.map(d => (
                                    <div 
                                        key={d.id}
                                        onClick={() => onEdit(d)}
                                        className={`p-1.5 rounded-md text-[11px] font-semibold leading-tight cursor-pointer hover:opacity-80 transition-opacity ${getDeadlineTypePillStyle(d.type)} ${d.isCompleted ? 'opacity-50 line-through' : ''}`}
                                    >
                                        {d.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const DeadlinesScreen: React.FC<DeadlinesScreenProps> = ({ projectId, user }) => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [deletingDeadline, setDeletingDeadline] = useState<Deadline | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = () => {
    setDeadlines(dataService.getDeadlines(projectId).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    setProperties(dataService.getProperties(projectId));
  };
  
  const handleAddDeadline = (deadlineData: Omit<Deadline, 'id' | 'isCompleted' | 'history'>) => {
    dataService.addDeadline({ ...deadlineData, projectId }, user.id);
    loadData();
    setAddModalOpen(false);
  };
  
  const handleUpdateDeadline = (updatedDeadline: Deadline) => {
    dataService.updateDeadline(updatedDeadline, user.id);
    loadData();
    setEditingDeadline(null);
  };
  
  const handleDeleteDeadline = () => {
    if (deletingDeadline) {
      dataService.deleteDeadline(deletingDeadline.id);
      loadData();
      setDeletingDeadline(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    dataService.toggleDeadlineStatus(id, user.id);
    loadData();
  };

  const getDeadlineTypeStyle = (type: DeadlineType) => {
    switch (type) {
      case DeadlineType.RENT: return 'bg-blue-100 text-blue-800';
      case DeadlineType.TAX: return 'bg-red-100 text-red-800';
      case DeadlineType.MAINTENANCE: return 'bg-yellow-100 text-yellow-800';
      case DeadlineType.CONTRACT: return 'bg-purple-100 text-purple-800';
      case DeadlineType.DOCUMENT: return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleSection = (propertyId: string) => {
    setOpenSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(propertyId)) {
            newSet.delete(propertyId);
        } else {
            newSet.add(propertyId);
        }
        return newSet;
    });
  };

  // FIX: Explicitly type the accumulator in reduce to aid type inference.
  const groupedDeadlines = useMemo(() => {
    return deadlines.reduce<Record<string, Deadline[]>>((acc, deadline) => {
        (acc[deadline.propertyId] = acc[deadline.propertyId] || []).push(deadline);
        return acc;
    }, {});
  }, [deadlines]);
  
  const columns: Column<Deadline>[] = [
      { header: 'Stato', accessor: 'isCompleted', render: (row) => (
          <button onClick={() => handleToggleStatus(row.id)} className={`p-2 rounded-full ${row.isCompleted ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}>
              <CheckCircle size={20} />
          </button>
      ), className: 'text-center' },
      { header: 'Scadenza', accessor: 'dueDate', render: (row) => {
          const daysLeft = Math.ceil((new Date(row.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          const isOverdue = !row.isCompleted && daysLeft < 0;
          const urgencyColor = isOverdue ? 'text-red-500' : daysLeft < 7 ? 'text-yellow-600' : 'text-gray-600';
          return (
              <div className={`font-medium ${urgencyColor}`}>
                  {new Date(row.dueDate).toLocaleDateString('it-IT')}
                  {!row.isCompleted && <span className="text-xs block">{isOverdue ? `Scaduto da ${Math.abs(daysLeft)} gg` : `Mancano ${daysLeft} gg`}</span>}
              </div>
          );
      }},
      { header: 'Titolo', accessor: 'title', className: 'font-medium text-dark' },
      { header: 'Tipo', accessor: 'type', render: (row) => {
          const displayType = (row.type === DeadlineType.OTHER && row.typeOther) ? row.typeOther : row.type;
          return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDeadlineTypeStyle(row.type)}`}>{displayType}</span>;
      }},
      { header: 'Azioni', accessor: 'id', render: (row) => (
           <div className="flex justify-center items-center gap-4">
              <button onClick={() => setEditingDeadline(row)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
              <button onClick={() => setDeletingDeadline(row)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
          </div>
      ), className: 'text-center' },
  ];

  const propertyMap = useMemo(() => new Map(properties.map(p => [p.id, p.name])), [properties]);

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-dark">Gestione Scadenze</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                 <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}>
                    <List size={16}/> Elenco
                 </button>
                 <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-primary text-white shadow' : 'text-gray-600'}`}>
                    <CalendarDays size={16} /> Calendario
                 </button>
            </div>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
            >
              <PlusCircle size={18} className="mr-2" />
              Nuova
            </button>
          </div>
        </div>
        
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {Object.entries(groupedDeadlines).map(([propertyId, deadlinesForProperty], index) => {
              const propertyName = propertyMap.get(propertyId) || 'Immobile non trovato';
              const isOpen = openSections.has(propertyId);
              return (
                  <div key={propertyId} className={`rounded-lg overflow-hidden border ${getPropertyColors(index)}`}>
                      <button onClick={() => toggleSection(propertyId)} className={`w-full flex justify-between items-center p-4 text-left font-bold text-lg ${isOpen ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <span>{propertyName} <span className="text-sm font-medium text-gray-500">({deadlinesForProperty.length} scadenze)</span></span>
                          <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                          <div className="p-2 bg-white">
                              <InteractiveTable columns={columns} data={deadlinesForProperty} />
                          </div>
                      )}
                  </div>
              );
            })}
          </div>
        ) : (
          <CalendarView deadlines={deadlines} onEdit={setEditingDeadline} />
        )}
      </Card>

      <AddDeadlineModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddDeadline}
        projectId={projectId}
      />
      {editingDeadline && (
        <EditDeadlineModal
          isOpen={!!editingDeadline}
          onClose={() => setEditingDeadline(null)}
          onSave={handleUpdateDeadline}
          deadline={editingDeadline}
          projectId={projectId}
        />
      )}
      {deletingDeadline && (
        <ConfirmDeleteModal
          isOpen={!!deletingDeadline}
          onClose={() => setDeletingDeadline(null)}
          onConfirm={handleDeleteDeadline}
          message={`Sei sicuro di voler eliminare la scadenza "${deletingDeadline.title}"?`}
        />
      )}
    </>
  );
};

export default DeadlinesScreen;