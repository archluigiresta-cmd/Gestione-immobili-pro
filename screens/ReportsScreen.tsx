
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Property, Tenant, Contract, Payment, Expense, Maintenance, Deadline, Document } from '../types';
import PropertyReportCard, { AggregatedPropertyData } from '../components/reports/PropertyReportCard';
import ExportButton from '../components/ui/ExportButton';
import { Printer } from 'lucide-react';

interface ReportsScreenProps {
  projectId: string;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ projectId }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [filterProperty, setFilterProperty] = useState<string>('all');

    useEffect(() => {
        setProperties(dataService.getProperties(projectId));
    }, [projectId]);

    const aggregatedData = useMemo((): AggregatedPropertyData[] => {
        const tenants = dataService.getTenants(projectId);
        const contracts = dataService.getContracts(projectId);
        const payments = dataService.getPayments(projectId);
        const expenses = dataService.getExpenses(projectId);
        const maintenances = dataService.getMaintenances(projectId);
        const deadlines = dataService.getDeadlines(projectId);
        const documents = dataService.getDocuments(projectId);

        const targetProperties = filterProperty === 'all' 
            ? properties 
            : properties.filter(p => p.id === filterProperty);
        
        return targetProperties.map(prop => {
            const propContracts = contracts.filter(c => c.propertyId === prop.id);
            const propPayments = payments.filter(p => p.propertyId === prop.id);
            const propExpenses = expenses.filter(e => e.propertyId === prop.id);
            const propMaintenances = maintenances.filter(m => m.propertyId === prop.id);

            const paymentSubtotal = propPayments.reduce((sum, p) => sum + p.amount, 0);
            const expenseSubtotal = propExpenses.reduce((sum, e) => sum + e.amount, 0) + 
                                  propMaintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
            
            return {
                property: prop,
                tenants: tenants.filter(t => propContracts.some(pc => pc.tenantId === t.id)),
                contracts: propContracts,
                payments: propPayments,
                expenses: propExpenses,
                maintenances: propMaintenances,
                deadlines: deadlines.filter(d => d.propertyId === prop.id),
                documents: documents.filter(doc => doc.propertyId === prop.id),
                paymentSubtotal,
                expenseSubtotal,
            };
        });
    }, [projectId, properties, filterProperty]);
    
    const flatDataForExport = useMemo(() => {
        return aggregatedData.map(d => ({
            'ID Immobile': d.property.id,
            'Nome Immobile': d.property.name,
            'Indirizzo': d.property.address,
            'Entrate Totali': d.paymentSubtotal,
            'Spese Totali': d.expenseSubtotal,
            'Utile Netto': d.paymentSubtotal - d.expenseSubtotal,
            'Numero Contratti': d.contracts.length,
            'Numero Pagamenti': d.payments.length,
            'Numero Spese': d.expenses.length + d.maintenances.filter(m => m.cost).length,
        }));
    }, [aggregatedData]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-dark">Reportistica</h1>
            
            <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Immobile</label>
                        <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className="mt-1 block w-full input">
                            <option value="all">Tutti gli immobili</option>
                            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div className="flex gap-2 justify-self-end col-start-1 lg:col-start-4">
                        <ExportButton data={flatDataForExport} filename={`report_immobili_${new Date().toISOString().split('T')[0]}.csv`} />
                         <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
                            <Printer size={18} className="mr-2"/> Stampa
                        </button>
                    </div>
                </div>
            </Card>

            <div className="space-y-6">
                {aggregatedData.map(data => (
                    <PropertyReportCard key={data.property.id} data={data} />
                ))}
                {aggregatedData.length === 0 && (
                    <Card className="p-8 text-center text-gray-500">
                        Nessun dato da visualizzare per i filtri selezionati.
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ReportsScreen;
