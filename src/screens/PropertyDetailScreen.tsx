import React, { useState, useEffect } from 'react';
import { Property, Tenant, Contract, Expense, Maintenance, Deadline, Document, ProjectMemberRole, CustomField, CustomFieldType, HistoryLog, User } from '../types.ts';
import * as dataService from '../services/dataService.ts';
import Card from '../components/ui/Card.tsx';
import { ArrowLeft, Building2, Square, BedDouble, FileText, CircleDollarSign, Wrench, Calendar, Users, PlusCircle, Edit, Trash2, Info, History, UserCircle } from 'lucide-react';
import AddCustomFieldModal from '../components/modals/AddCustomFieldModal.tsx';
import EditCustomFieldModal from '../components/modals/EditCustomFieldModal.tsx';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal.tsx';

interface PropertyDetailScreenProps {
  propertyId: string;
  projectId: string;
  user: User;
  userRole: ProjectMemberRole;
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const generateId = (prefix: string): string => `${prefix}-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;

// Sub-components for tabs
const ExpensesTab: React.FC<{ expenses: Expense[] }> = ({ expenses }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead><tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Data</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Categoria</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Importo</th>
            </tr></thead>
            <tbody>{expenses.map(e => (
                <tr key={e.id} className="border-b"><td className="p-3">{new Date(e.date).toLocaleDateString('it-IT')}</td><td className="p-3 font-medium">{e.description}</td><td className="p-3">{e.category}</td><td className="p-3 text-right font-bold">€{e.amount.toLocaleString('it-IT')}</td></tr>
            ))}</tbody>
        </table>
         {expenses.length === 0 && <p className="text-center p-4 text-gray-500">Nessuna spesa registrata.</p>}
    </div>
);
const MaintenanceTab: React.FC<{ maintenances: Maintenance[] }> = ({ maintenances }) => (
     <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead><tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Data Richiesta</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Stato</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Costo</th>
            </tr></thead>
            <tbody>{maintenances.map(m => (
                <tr key={m.id} className="border-b"><td className="p-3">{new Date(m.requestDate).toLocaleDateString('it-IT')}</td><td className="p-3 font-medium">{m.description}</td><td className="p-3">{m.status}</td><td className="p-3 text-right font-bold">{m.cost ? `€${m.cost.toLocaleString('it-IT')}`: 'N/D'}</td></tr>
            ))}</tbody>
        </table>
        {maintenances.length === 0 && <p className="text-center p-4 text-gray-500">Nessuna manutenzione registrata.</p>}
    </div>
);
const DeadlinesTab: React.FC<{ deadlines: Deadline[] }> = ({ deadlines }) => (
     <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead><tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Data Scadenza</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Titolo</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Stato</th>
            </tr></thead>
            <tbody>{deadlines.map(d => (
                <tr key={d.id} className="border-b"><td className="p-3">{new Date(d.dueDate).toLocaleDateString('it-IT')}</td><td className="p-3 font-medium">{d.title}</td><td className="p-3">{d.type}</td><td className="p-3">{d.isCompleted ? 'Completata' : 'Aperta'}</td></tr>
            ))}</tbody>
        </table>
        {deadlines.length === 0 && <p className="text-center p-4 text-gray-500">Nessuna scadenza registrata.</p>}
    </div>
);
const DocumentsTab: React.FC<{ documents: Document[] }> = ({ documents }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead><tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Nome</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Data Caricamento</th>
            </tr></thead>
            <tbody>{documents.map(d => (
                <tr key={d.id} className="border-b"><td className="p-3 font-medium">{d.name}</td><td className="p-3">{d.type}</td><td className="p-3">{new Date(d.uploadDate).toLocaleDateString('it-IT')}</td></tr>
            ))}</tbody>
        </table>
        {documents.length === 0 && <p className="text-center p-4 text-gray-500">Nessun documento registrato.</p>}
    </div>
);

const HistoryTab: React.FC<{ historyLogs: HistoryLog[] }> = ({ historyLogs }) => {
    const getUserName = (userId: string) => dataService.getUser(userId)?.name || 'Utente Sconosciuto';

    const sortedHistory = [...(historyLogs || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-4">
            {sortedHistory.map(log => (
                <div key={log.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <UserCircle size={24} className="text-primary mt-1" />
                    <div>
                        <p className="font-semibold text-dark">{getUserName(log.userId)}</p>
                        <p className="text-sm text-gray-700">{log.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {new Date(log.timestamp).toLocaleString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            ))}
            {sortedHistory.length === 0 && <p className="text-center p-4 text-gray-500">Nessuna cronologia di modifiche disponibile.</p>}
        </div>
    );
};


const PropertyDetailScreen: React.FC<PropertyDetailScreenProps> = ({ propertyId, projectId, user, userRole, onBack, onNavigate }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [activeTab, setActiveTab] = useState('tenant');
  
  const [isAddCfModalOpen, setAddCfModalOpen] = useState(false);
  const [editingCf, setEditingCf] = useState<CustomField | null>(null);
  const [deletingCf, setDeletingCf] = useState<CustomField | null>(null);

  const isViewer = userRole === ProjectMemberRole.VIEWER;

  const loadPropertyData = () => {
    const prop = dataService.getProperty(projectId, propertyId);
    if (prop) {
      setProperty(prop);
      setExpenses(dataService.getExpenses(projectId).filter(e => e.propertyId === prop.id));
      setMaintenances(dataService.getMaintenances(projectId).filter(m => m.propertyId === prop.id));
      setDeadlines(dataService.getDeadlines(projectId).filter(d => d.propertyId === prop.id));
      setDocuments(dataService.getDocuments(projectId).filter(d => d.propertyId === prop.id));

      if (prop.isRented) {
        const linkedContract = dataService.getContracts(projectId).find(c => c.propertyId === prop.id);
        setContract(linkedContract || null);
        if (linkedContract) {
          const linkedTenant = dataService.getTenants(projectId).find(t => t.id === linkedContract.tenantId);
          setTenant(linkedTenant || null);
        }
      } else {
        setContract(null);
        setTenant(null);
      }
    }
  }

  useEffect(() => {
    loadPropertyData();
  }, [propertyId, projectId]);
  
  const handleAddCustomField = (fieldData: Omit<CustomField, 'id'>) => {
      if(!property) return;
      const newField: CustomField = { ...fieldData, id: generateId('cf') };
      const updatedProperty = { ...property, customFields: [...(property.customFields || []), newField] };
      dataService.updateProperty(updatedProperty, user.id);
      loadPropertyData();
      setAddCfModalOpen(false);
  }
  
  const handleUpdateCustomField = (updatedField: CustomField) => {
      if(!property) return;
      const updatedFields = (property.customFields || []).map(f => f.id === updatedField.id ? updatedField : f);
      const updatedProperty = { ...property, customFields: updatedFields };
      dataService.updateProperty(updatedProperty, user.id);
      loadPropertyData();
      setEditingCf(null);
  }
  
  const handleDeleteCustomField = () => {
      if(!property || !deletingCf) return;
      const updatedFields = (property.customFields || []).filter(f => f.id !== deletingCf.id);
      const updatedProperty = { ...property, customFields: updatedFields };
      dataService.updateProperty(updatedProperty, user.id);
      loadPropertyData();
      setDeletingCf(null);
  }

  if (!property) {
    return (
        <div>
            <button onClick={onBack} className="flex items-center text-primary mb-4 hover:underline">
                <ArrowLeft size={18} className="mr-2" /> Torna agli immobili
            </button>
            <p>Immobile non trovato.</p>
        </div>
    );
  }

  const baseTabs = [
    { id: 'tenant', label: 'Inquilino/Contratto', icon: Users },
    { id: 'expenses', label: 'Spese', icon: CircleDollarSign },
    { id: 'maintenance', label: 'Manutenzioni', icon: Wrench },
    { id: 'deadlines', label: 'Scadenze', icon: Calendar },
    { id: 'documents', label: 'Documenti', icon: FileText },
  ];

  const tabs = userRole === ProjectMemberRole.OWNER
    ? [...baseTabs, { id: 'history', label: 'Cronologia', icon: History }]
    : baseTabs;


  const handleAddButton = () => {
    const screenMap: { [key: string]: string } = {
        expenses: 'expenses',
        maintenance: 'maintenance',
        deadlines: 'deadlines',
        documents: 'documents',
        tenant: 'contracts'
    };
    if(screenMap[activeTab]) {
        onNavigate(screenMap[activeTab]);
    }
  }
  
  const renderCustomFieldValue = (field: CustomField) => {
    if(field.type === CustomFieldType.BOOLEAN) {
        return <span className={`font-bold ${field.value ? 'text-green-600' : 'text-red-600'}`}>{field.value ? 'Sì' : 'No'}</span>
    }
    return <span className="text-dark font-mono">{field.value}</span>
  }
  
  const allHistory = [
    ...(property.history || []),
    ...expenses.flatMap(i => i.history || []),
    ...maintenances.flatMap(i => i.history || []),
    ...deadlines.flatMap(i => i.history || []),
    ...documents.flatMap(i => i.history || []),
    ...(contract?.history || []),
    ...(tenant?.history || []),
  ];

  const customFields = property.customFields || [];

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-primary hover:underline font-semibold">
        <ArrowLeft size={18} className="mr-2" /> Torna a tutti gli immobili
      </button>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
            <Card className="sticky top-6">
                <img src={property.imageUrl} alt={property.name} className="w-full h-56 object-cover rounded-t-xl" />
                <div className="p-6">
                    <span className="text-sm font-bold text-primary">{property.code}</span>
                    <h1 className="text-2xl font-bold text-dark">{property.name}</h1>
                    <p className="text-gray-600 mt-1">{property.address}</p>
                    <div className="mt-4 border-t pt-4 grid grid-cols-3 gap-4 text-sm text-center">
                        <div><strong className="text-gray-600 block flex items-center justify-center gap-1.5"><Building2 size={14}/>Tipo</strong> {property.type}</div>
                        <div><strong className="text-gray-600 block flex items-center justify-center gap-1.5"><Square size={14}/>Superficie</strong> {property.surface} mq</div>
                        <div><strong className="text-gray-600 block flex items-center justify-center gap-1.5"><BedDouble size={14}/>Locali</strong> {property.rooms}</div>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-dark flex items-center"><Info size={18} className="mr-2 text-primary"/>Informazioni Personalizzate</h2>
                    <button 
                        onClick={() => setAddCfModalOpen(true)}
                        className="flex items-center text-sm px-3 py-1.5 bg-secondary text-primary font-semibold rounded-lg hover:bg-blue-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                        disabled={isViewer}
                    >
                        <PlusCircle size={16} className="mr-2"/> Aggiungi Campo
                    </button>
                </div>
                <div className="space-y-3">
                    {customFields.length > 0 ? customFields.map(field => (
                        <div key={field.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                           <div>
                             <p className="text-sm font-semibold text-gray-800">{field.label}</p>
                             {renderCustomFieldValue(field)}
                           </div>
                           {!isViewer && <div>
                               <button onClick={() => setEditingCf(field)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={16}/></button>
                               <button onClick={() => setDeletingCf(field)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                           </div>}
                        </div>
                    )) : <p className="text-sm text-center text-gray-500 py-4">Nessun campo personalizzato. Aggiungine uno!</p>}
                </div>
            </Card>

        </div>
        <div className="xl:col-span-2">
            <Card>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex gap-4 p-4 overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`shrink-0 flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-dark">{tabs.find(t=>t.id === activeTab)?.label}</h2>
                        {activeTab !== 'history' && (
                            <button 
                                onClick={handleAddButton}
                                className="flex items-center text-sm px-3 py-1.5 bg-secondary text-primary font-semibold rounded-lg hover:bg-blue-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                disabled={isViewer}
                            >
                                <PlusCircle size={16} className="mr-2"/> Aggiungi
                            </button>
                        )}
                    </div>

                    {activeTab === 'tenant' && (
                         property.isRented && contract && tenant ? (
                            <div className="space-y-4">
                                <div><p className="text-sm text-gray-500">Inquilino</p><p className="font-semibold text-dark">{tenant.name}</p><p className="text-sm text-gray-700">{tenant.email} | {tenant.phone}</p></div>
                                <div><p className="text-sm text-gray-500">Contratto</p><p className="font-semibold text-dark">Dal {new Date(contract.startDate).toLocaleDateString('it-IT')} al {new Date(contract.endDate).toLocaleDateString('it-IT')}</p></div>
                                <div><p className="text-sm text-gray-500">Canone Mensile</p><p className="font-bold text-lg text-primary">€{contract.rentAmount.toLocaleString('it-IT')}</p></div>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-green-50 rounded-lg"><p className="font-semibold text-green-800">Immobile attualmente libero</p></div>
                        )
                    )}
                    {activeTab === 'expenses' && <ExpensesTab expenses={expenses} />}
                    {activeTab === 'maintenance' && <MaintenanceTab maintenances={maintenances} />}
                    {activeTab === 'deadlines' && <DeadlinesTab deadlines={deadlines} />}
                    {activeTab === 'documents' && <DocumentsTab documents={documents} />}
                    {activeTab === 'history' && <HistoryTab historyLogs={allHistory} />}
                </div>
            </Card>
        </div>
      </div>
      
      <AddCustomFieldModal 
        isOpen={isAddCfModalOpen}
        onClose={() => setAddCfModalOpen(false)}
        onSave={handleAddCustomField}
      />
      
      {editingCf && (
        <EditCustomFieldModal 
            isOpen={!!editingCf}
            onClose={() => setEditingCf(null)}
            onSave={handleUpdateCustomField}
            field={editingCf}
        />
      )}

      {deletingCf && (
        <ConfirmDeleteModal
            isOpen={!!deletingCf}
            onClose={() => setDeletingCf(null)}
            onConfirm={handleDeleteCustomField}
            message={`Sei sicuro di voler eliminare il campo "${deletingCf.label}"?`}
        />
      )}
    </div>
  );
};

export default PropertyDetailScreen;