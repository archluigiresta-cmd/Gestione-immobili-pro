

import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Payment, PaymentStatus, Property, ProjectMemberRole, User, Contract, Tenant } from '../types';
import { CheckCircle, Clock, AlertCircle, PlusCircle, Edit, Trash2, DollarSign } from 'lucide-react';
import AccordionItem from '../components/ui/AccordionItem';
import ExportButton from '../components/ui/ExportButton';
import AddPaymentModal from '../components/modals/AddPaymentModal';
import EditPaymentModal from '../components/modals/EditPaymentModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

interface PaymentsScreenProps {
  projectId: string;
  user: User;
  userRole: ProjectMemberRole;
}

type EnrichedPayment = Payment & {
    propertyName: string;
    tenantName: string;
};

const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ projectId, user, userRole }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<EnrichedPayment | null>(null);
    const [deletingPayment, setDeletingPayment] = useState<EnrichedPayment | null>(null);

    const [filterProperty, setFilterProperty] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const isViewer = userRole === ProjectMemberRole.VIEWER;

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = () => {
        setPayments(dataService.getPayments(projectId));
        setProperties(dataService.getProperties(projectId));
        setContracts(dataService.getContracts(projectId));
        setTenants(dataService.getTenants(projectId));
    };
    
    const handleAddPayment = (paymentData: Omit<Payment, 'id' | 'history'>) => {
        dataService.addPayment({ ...paymentData, projectId }, user.id);
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
        const propertyMap = new Map(properties.map(p => [p.id, p.name]));
        const contractMap = new Map(contracts.map(c => [c.id, c.tenantId]));
        const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

        return payments.map(p => {
            const tenantId = contractMap.get(p.contractId);
            return {
                ...p,
                propertyName: propertyMap.get(p.propertyId) || 'N/A',
                tenantName: tenantId ? tenantMap.get(tenantId) || 'N/A' : 'N/A',
            };
        });
    }, [payments, properties, contracts, tenants]);


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

    const groupedPayments = useMemo(() => {
        return filteredPayments.reduce((acc, payment) => {
            const key = payment.propertyId;
            if(!acc[key]) acc[key] = [];
            acc[key].push(payment);
            return acc;
        }, {} as Record<string, EnrichedPayment[]>);
    }, [filteredPayments]);

    const grandTotal = useMemo(() => {
        return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    }, [filteredPayments]);
    
    const getStatusInfo = (status: PaymentStatus) => {
        switch(status) {
            case PaymentStatus.PAID: return { badge: 'bg-green-100 text-green-800', icon: <CheckCircle size={16} className="text-green-600" /> };
            case PaymentStatus.PENDING: return { badge: 'bg-blue-100 text-blue-800', icon: <Clock size={16} className="text-blue-600" /> };
            case PaymentStatus.LATE: return { badge: 'bg-red-100 text-red-800', icon: <AlertCircle size={16} className="text-red-600" /> };
            default: return { badge: 'bg-gray-100 text-gray-800', icon: null };
        }
    };

    const statusFilters: {label: string, value: PaymentStatus | 'all'}[] = [
        { label: 'Tutti', value: 'all' },
        { label: 'Pagato', value: PaymentStatus.PAID },
        { label: 'In Attesa', value: PaymentStatus.PENDING },
        { label: 'In Ritardo', value: PaymentStatus.LATE },
    ];
    
    return (
        <>
        <div className="space-y-6">
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
            
            <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </Card>

            <div className="space-y-4">
                {properties.filter(p => groupedPayments[p.id]).map(property => {
                    const propertyPayments = groupedPayments[property.id];
                    const subtotal = propertyPayments.reduce((sum, p) => sum + p.amount, 0);
                    const title = (
                        <div className="flex items-center gap-3">
                            <span>{property.name}</span>
                            <span className="text-sm bg-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded-full">{propertyPayments.length}</span>
                        </div>
                    );
                    return (
                        <AccordionItem key={property.id} title={title}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Inquilino</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Riferimento</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600">Data Pag.</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600 text-right">Importo</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600 text-center">Stato</th>
                                            <th className="p-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {propertyPayments.map(row => {
                                            const statusInfo = getStatusInfo(row.status);
                                            return(
                                                <tr key={row.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                                    <td className="p-3 font-medium">{row.tenantName}</td>
                                                    <td className="p-3 text-gray-700">{String(row.referenceMonth).padStart(2, '0')}/{row.referenceYear}</td>
                                                    <td className="p-3 text-gray-700">{row.paymentDate ? new Date(row.paymentDate).toLocaleDateString('it-IT') : '---'}</td>
                                                    <td className="p-3 text-right font-bold text-gray-800">€{row.amount.toLocaleString('it-IT')}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                                                            {statusInfo.icon && <span className="mr-1.5">{statusInfo.icon}</span>}
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center items-center gap-4">
                                                            <button onClick={() => setEditingPayment(row)} className="text-blue-600 hover:text-blue-800 disabled:text-gray-400" disabled={isViewer}><Edit size={18} /></button>
                                                            <button onClick={() => setDeletingPayment(row)} className="text-red-600 hover:text-red-800 disabled:text-gray-400" disabled={isViewer}><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-blue-50">
                                            <td colSpan={3} className="p-3 text-right font-bold text-primary">Subtotale</td>
                                            <td colSpan={3} className="p-3 text-left font-bold text-lg text-primary">€{subtotal.toLocaleString('it-IT', {minimumFractionDigits: 2})}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </AccordionItem>
                    )
                })}
                 {Object.keys(groupedPayments).length === 0 && (
                    <Card className="p-8 text-center text-gray-500">
                        Nessun pagamento trovato per i filtri selezionati.
                    </Card>
                )}
            </div>

            <Card className="p-4 bg-blue-900 text-white">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <DollarSign size={24} />
                        <h3 className="text-xl font-bold">Totale Complessivo</h3>
                    </div>
                    <p className="text-3xl font-bold">€{grandTotal.toLocaleString('it-IT', {minimumFractionDigits: 2})}</p>
                </div>
            </Card>
        </div>

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