import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Property, Payment, Expense, Maintenance, Tenant, Contract, Deadline, Document } from '../types';
import PropertyReportCard, { AggregatedPropertyData } from '../components/reports/PropertyReportCard';
import ExportButton from '../components/ui/ExportButton';
import { AreaChart, Play } from 'lucide-react';

interface ReportsScreenProps {
  projectId: string;
}

enum ReportType {
    NONE = 'none',
    FINANCIAL_SUMMARY_BY_PROPERTY = 'financial_summary_by_property',
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ projectId }) => {
    const [reportType, setReportType] = useState<ReportType>(ReportType.NONE);
    const [startDate, setStartDate] = useState<string>(() => new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState<AggregatedPropertyData[] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = () => {
        setIsGenerating(true);
        setReportData(null);

        // Simulate generation time for better UX
        setTimeout(() => {
            if (reportType === ReportType.FINANCIAL_SUMMARY_BY_PROPERTY) {
                const properties = dataService.getProperties(projectId);
                const allTenants = dataService.getTenants(projectId);
                const allContracts = dataService.getContracts(projectId);
                const allPayments = dataService.getPayments(projectId);
                const allExpenses = dataService.getExpenses(projectId);
                const allMaintenances = dataService.getMaintenances(projectId);
                const allDeadlines = dataService.getDeadlines(projectId);
                const allDocuments = dataService.getDocuments(projectId);

                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999); // Include the whole end day

                const aggregatedData = properties.map(property => {
                    const contracts = allContracts.filter(c => c.propertyId === property.id);
                    const contractIds = new Set(contracts.map(c => c.id));
                    const tenants = allTenants.filter(t => contractIds.has(t.contractId));

                    const payments = allPayments.filter(p => p.propertyId === property.id && new Date(p.dueDate) >= start && new Date(p.dueDate) <= end);
                    const expenses = allExpenses.filter(e => e.propertyId === property.id && new Date(e.date) >= start && new Date(e.date) <= end);
                    const maintenances = allMaintenances.filter(m => m.propertyId === property.id && new Date(m.requestDate) >= start && new Date(m.requestDate) <= end);
                    
                    const paymentSubtotal = payments.reduce((sum, p) => sum + p.amount, 0);
                    const expenseSubtotal = expenses.reduce((sum, e) => sum + e.amount, 0) + maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
                    
                    return {
                        property,
                        tenants,
                        contracts,
                        payments,
                        expenses,
                        maintenances,
                        documents: allDocuments.filter(d => d.propertyId === property.id),
                        deadlines: allDeadlines.filter(d => d.propertyId === property.id),
                        paymentSubtotal,
                        expenseSubtotal,
                    };
                });
                setReportData(aggregatedData);
            }
            setIsGenerating(false);
        }, 500);
    };
    
    const exportableData = useMemo(() => {
        if (!reportData) return [];
        return reportData.map(d => ({
            'Immobile': d.property.name,
            'Indirizzo': d.property.address,
            'Entrate Totali': d.paymentSubtotal.toFixed(2),
            'Spese Totali': d.expenseSubtotal.toFixed(2),
            'Utile/Perdita': (d.paymentSubtotal - d.expenseSubtotal).toFixed(2),
            'Numero Pagamenti': d.payments.length,
            'Numero Spese': d.expenses.length + d.maintenances.filter(m => m.cost).length,
        }));
    }, [reportData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <AreaChart size={28} className="text-primary"/>
                <h1 className="text-2xl font-bold text-dark">Reportistica Avanzata</h1>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-bold text-dark mb-4">Pannello di Controllo Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Tipo di Report</label>
                        <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} className="mt-1 block w-full input">
                            <option value={ReportType.NONE}>Seleziona un report...</option>
                            <option value={ReportType.FINANCIAL_SUMMARY_BY_PROPERTY}>Riepilogo Finanziario per Immobile</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Inizio</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full input" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Fine</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full input" />
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleGenerateReport}
                        disabled={reportType === ReportType.NONE || isGenerating}
                        className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                         <Play size={18} className="mr-2" />
                        {isGenerating ? 'Generazione in corso...' : 'Genera Report'}
                    </button>
                </div>
            </Card>
            
            <div id="report-results">
                {isGenerating && (
                    <Card className="p-8 text-center text-gray-500">
                        <p>Analisi dei dati in corso...</p>
                    </Card>
                )}
                {reportData && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-dark">Risultati del Report</h2>
                            <ExportButton data={exportableData} filename={`report_finanziario_${startDate}_${endDate}.csv`} />
                        </div>
                        {reportData.map(data => (
                            <PropertyReportCard key={data.property.id} data={data} />
                        ))}
                    </div>
                )}
                {!reportData && !isGenerating && (
                     <Card className="p-12 text-center text-gray-500 border-2 border-dashed">
                        <p>Seleziona i criteri e clicca su "Genera Report" per visualizzare i dati.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ReportsScreen;