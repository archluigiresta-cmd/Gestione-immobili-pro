import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Payment, PaymentStatus, Property, ProjectMemberRole, User, Contract, Tenant } from '../types';
import { CheckCircle, Clock, AlertCircle, PlusCircle, Edit, Trash2, ChevronDown } from 'lucide-react';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';
import ExportButton from '../components/ui/ExportButton';
import AddPaymentModal from '../components/modals/AddPaymentModal';
import EditPaymentModal from '../components/modals/EditPaymentModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

interface PaymentsScreenProps {
  projectId: string;
  user: User;
  userRole: ProjectMemberRole;
}

interface EnrichedPayment extends Payment {
    propertyName: string;
    tenantName: string;
}

const getPropertyColors = (index: number) => {
    const colors = [
        'border-green-500', 'border-indigo-500', 'border-purple-500', 'border-pink-500',
        'border-yellow-500', 'border-red-500', 'border-teal-500', 'border-blue-500'
    ];
    return colors[index % colors.length];
};

const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ projectId, user, userRole }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<EnrichedPayment | null>(null);
    const [deletingPayment, setDeletingPayment] = useState<EnrichedPayment | null>(null);

    const [filterProperty, setFilterProperty] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());
    
    const isViewer = userRole === ProjectMemberRole.VIEWER;

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = () => {
        setPayments(dataService.getPayments(projectId));
        setProperties(dataService.getProperties(projectId));
    };
    
    const handleAddPayment = (paymentData: Omit<Payment, 'id' | 'history'>) => {
        dataService.addPayment(paymentData, user.id);
        loadData();
        setAddModalOpen(false);
    };
    
    const handleUpdatePayment = (updatedPayment: Payment) => {
        dataService.updatePayment(updatedPayment, user.id);
        loadData();
        setEditingPayment(null);
    };

    const handleDeletePayment = () => {
        if (deletingPayment) {
            dataService.deletePayment(deletingPayment.id);
            loadData();
            setDeletingPayment(null);
        }
    };

    const enrichedPayments: EnrichedPayment[] = useMemo(() => {
        const contracts = dataService.getContracts(projectId);
        const tenants = dataService.getTenants(projectId);

        const propertyMap = new Map(properties.map(p => [p.id, p.name]));
        const contractMap = new Map(contracts.map(c => [c.id, { tenantId: c.tenantId }]));
        const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

        const getTenantNameByContract = (contractId: string) => {
            const contract = contractMap.get(contractId);
            return contract ? tenantMap.get(contract.tenantId) || 'N/A' : 'N/A';
        };

        return payments.map(p => ({
            ...p,
            propertyName: propertyMap.get(p.propertyId) || 'N/A',
            tenantName: getTenantNameByContract(p.contractId),
        }));
    }, [payments, properties, projectId]);


    const filteredPayments = useMemo(() => {
        return enrichedPayments.filter(payment => {
            const propertyMatch = filterProperty === 'all' || payment.propertyId === filterProperty;
            const statusMatch = filterStatus === 'all' || payment.status === filterStatus;
            const searchMatch = searchTerm === '' ||
                payment.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                payment.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
            return propertyMatch && statusMatch && searchMatch;
        });
    }, [enrichedPayments, filterProperty, filterStatus, searchTerm]);
    
    const getStatusInfo = (status: PaymentStatus) => {
        switch(status) {
            case PaymentStatus.PAID: return { badge: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="text-green-600" /> };
            case PaymentStatus.PENDING: return { badge: 'bg-blue-100 text-blue-800', icon: <Clock size={16} className="text-blue-600" /> };
            case PaymentStatus.LATE: return { badge: 'bg-red-100 text-red-800', icon: <AlertCircle size={16} className="text-red-600" /> };
            default: return { badge: 'bg-gray-100 text-gray-800', icon: null };
        }
    };
    
    const columns: Column<EnrichedPayment>[] = [
        { header: 'Inquilino', accessor: 'tenantName' },
        { header: 'Riferimento', accessor: 'referenceMonth', render: (row) => `${String(row.referenceMonth).padStart(2, '0')}/${row.referenceYear}` },
        { header: 'Data Pagamento', accessor: 'paymentDate', render: (row) => row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('it-IT') : '---' },
        { header: 'Importo', accessor: 'amount', render: (row) => `€${row.amount.toLocaleString('it-IT')}`, className: 'text-right font-bold' },
        { 
            header: 'Stato', 
            accessor: 'status',
            render: (row) => {
                const statusInfo = getStatusInfo(row.status);
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                        {statusInfo.icon && <span className="mr-1.5">{statusInfo.icon}</span>}
                        {row.status}
                    </span>
                );
            },
            className: 'text-center'
        },
        { 
            header: 'Azioni', 
            accessor: 'id',
            render: (row) => (
                <div className="flex justify-center items-center gap-4">
                    <button onClick={() => setEditingPayment(row)} className="text-blue-600 hover:text-blue-800 disabled:text-gray-400" disabled={isViewer}><Edit size={18} /></button>
                    <button onClick={() => setDeletingPayment(row)} className="text-red-600 hover:text-red-800 disabled:text-gray-400" disabled={isViewer}><Trash2 size={18} /></button>
                </div>
            ),
            className: 'text-center'
        },
    ];

    const statusFilters: {label: string, value: PaymentStatus | 'all'}[] = [
        { label: 'Tutti', value: 'all' },
        { label: 'Pagato', value: PaymentStatus.PAID },
        { label: 'In Attesa', value: PaymentStatus.PENDING },
        { label: 'In Ritardo', value: PaymentStatus.LATE },
    ];

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

    const groupedPayments = useMemo(() => {
      return filteredPayments.reduce((acc, payment) => {
          (acc[payment.propertyId] = acc[payment.propertyId] || []).push(payment);
          return acc;
      }, {} as Record<string, EnrichedPayment[]>);
    }, [filteredPayments]);
    
    return (
        <>
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-dark">Registro Pagamenti e Entrate</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <ExportButton data={filteredPayments} filename="pagamenti.csv" />
            <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isViewer}
            >
                <PlusCircle size={18} className="mr-2" />
                Registra Pagamento
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="col-span-1">
                <label htmlFor="property-filter" className="block text-sm font-medium text-gray-700 mb-1">Filtra per Immobile</label>
                <select 
                    id="property-filter"
                    value={filterProperty} 
                    onChange={e => setFilterProperty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                >
                    <option value="all">Tutti gli immobili</option>
                    {properties.map((p: Property) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="col-span-1">
                <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">Cerca Inquilino</label>
                <input 
                    type="text"
                    id="search-filter"
                    placeholder="Nome inquilino..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
            </div>
             <div className="col-span-1 md:col-span-3">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Filtra per Stato</label>
                 <div className="flex flex-wrap gap-2">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterStatus(filter.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${filterStatus === filter.value ? 'bg-primary text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                 </div>
            </div>
        </div>
        
        <div className="space-y-4">
          {Object.entries(groupedPayments).map(([propertyId, paymentsForProperty], index) => {
              const propertyName = properties.find(p => p.id === propertyId)?.name || 'Immobile non trovato';
              const isOpen = openSections.has(propertyId);
              return (
                  <div key={propertyId} className={`rounded-lg overflow-hidden border ${getPropertyColors(index)}`}>
                      <button onClick={() => toggleSection(propertyId)} className={`w-full flex justify-between items-center p-4 text-left font-bold text-lg ${isOpen ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                          <span>{propertyName} <span className="text-sm font-medium text-gray-500">({paymentsForProperty.length} pagamenti)</span></span>
                          <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                          <div className="p-2 bg-white">
                              <InteractiveTable columns={columns} data={paymentsForProperty} />
                          </div>
                      )}
                  </div>
              );
          })}
        </div>
        {filteredPayments.length === 0 && (
            <div className="text-center p-8 text-gray-500">
                Nessun pagamento trovato per i filtri selezionati.
            </div>
        )}
      </Card>
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddPayment}
        projectId={projectId}
      />
      {editingPayment && (
        <EditPaymentModal
            isOpen={!!editingPayment}
            onClose={() => setEditingPayment(null)}
            onSave={handleUpdatePayment}
            payment={editingPayment}
            projectId={projectId}
        />
      )}
      {deletingPayment && (
        <ConfirmDeleteModal
            isOpen={!!deletingPayment}
            onClose={() => setDeletingPayment(null)}
            onConfirm={handleDeletePayment}
            message={`Sei sicuro di voler eliminare questo pagamento di €${deletingPayment.amount} per ${deletingPayment.tenantName}?`}
        />
      )}
      </>
    );
};

export default PaymentsScreen;
