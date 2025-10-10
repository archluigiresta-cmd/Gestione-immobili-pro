import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import { MOCK_PAYMENTS, MOCK_PROPERTIES, MOCK_TENANTS, MOCK_CONTRACTS } from '../constants';
import { Payment, PaymentStatus, Property } from '../types';
import { CheckCircle, Clock, AlertCircle, PlusCircle, ArrowUpDown, Download } from 'lucide-react';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';
import ExportButton from '../components/ui/ExportButton';

const PaymentsScreen: React.FC = () => {
    const [filterProperty, setFilterProperty] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const tenantMap = useMemo(() => {
        const map = new Map<string, string>();
        MOCK_TENANTS.forEach(t => map.set(t.id, t.name));
        return map;
    }, []);

    const contractMap = useMemo(() => {
        const map = new Map<string, { tenantId: string }>();
        MOCK_CONTRACTS.forEach(c => map.set(c.id, { tenantId: c.tenantId }));
        return map;
    }, []);

    const propertyMap = useMemo(() => {
        const map = new Map<string, string>();
        MOCK_PROPERTIES.forEach(p => map.set(p.id, p.name));
        return map;
    }, []);

    const getTenantNameByContract = (contractId: string) => {
        const contract = contractMap.get(contractId);
        if (!contract) return 'N/A';
        return tenantMap.get(contract.tenantId) || 'N/A';
    };

    const getPropertyName = (id: string) => propertyMap.get(id) || 'N/A';

    const enrichedPayments = useMemo(() => MOCK_PAYMENTS.map(p => ({
        ...p,
        propertyName: getPropertyName(p.propertyId),
        tenantName: getTenantNameByContract(p.contractId),
    })), [propertyMap, tenantMap, contractMap]);

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
    
    const columns: Column<(typeof filteredPayments)[0]>[] = [
        { header: 'Immobile', accessor: 'propertyName' },
        { header: 'Inquilino', accessor: 'tenantName' },
        { header: 'Riferimento', accessor: 'referenceMonth', render: (row) => `${row.referenceMonth.toString().padStart(2, '0')}/${row.referenceYear}` },
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
    ];

    const statusFilters: {label: string, value: PaymentStatus | 'all'}[] = [
        { label: 'Tutti', value: 'all' },
        { label: 'Pagato', value: PaymentStatus.PAID },
        { label: 'In Attesa', value: PaymentStatus.PENDING },
        { label: 'In Ritardo', value: PaymentStatus.LATE },
    ];
    
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-dark">Registro Pagamenti e Entrate</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <ExportButton data={filteredPayments} filename="pagamenti.csv" />
            <button
                onClick={() => alert("Funzionalità 'Registra Pagamento' da implementare.")}
                className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm w-full sm:w-auto"
            >
                <PlusCircle size={18} className="mr-2" />
                Registra Pagamento
            </button>
          </div>
        </div>
        
        {/* Controls */}
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
                    {MOCK_PROPERTIES.map((p: Property) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="col-span-1">
                <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">Cerca</label>
                <input 
                    type="text"
                    id="search-filter"
                    placeholder="Nome inquilino o immobile..."
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
        
        <InteractiveTable columns={columns} data={filteredPayments} />
        
      </Card>
    );
};

export default PaymentsScreen;
