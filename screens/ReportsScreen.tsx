
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';
import ExportButton from '../components/ui/ExportButton';
// FIX: Corrected import path to point to the correct file location.
import * as dataService from '../services/dataService';
import { Payment, Expense, Maintenance, Property, PaymentStatus, ExpenseCategory, MaintenanceStatus, Contract, Tenant, Document, CustomField } from '../types';
import { BarChart, FileSearch, Filter, Settings2, Database, DollarSign, Building, Users, FileText as FileTextIcon, Wrench, Library } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PropertyReportCard, { AggregatedPropertyData } from '../components/reports/PropertyReportCard';


type ReportCategory = 'financial' | 'registry' | 'summary';
type ReportType = 'payments' | 'expenses' | 'maintenance' | 'properties' | 'contracts' | 'tenants' | 'documents' | 'propertySummary';

interface ReportsScreenProps {
  projectId: string;
}

const reportTypesConfig = {
    financial: [
        { id: 'payments', name: 'Pagamenti', icon: DollarSign },
        { id: 'expenses', name: 'Spese', icon: DollarSign },
        { id: 'maintenance', name: 'Manutenzioni', icon: Wrench },
    ],
    registry: [
        { id: 'properties', name: 'Immobili', icon: Building },
        { id: 'contracts', name: 'Contratti', icon: FileTextIcon },
        { id: 'tenants', name: 'Inquilini', icon: Users },
        { id: 'documents', name: 'Documenti', icon: FileTextIcon },
    ],
    summary: [
        { id: 'propertySummary', name: 'Riepilogo per Immobile', icon: Library },
    ]
};

/**
 * A "bulletproof" helper function to robustly extract plain text from any cell data for PDF/CSV export.
 */
const getTextFromCell = (data: React.ReactNode): string => {
    if (data === null || data === undefined) return '';
    if (typeof data === 'boolean') return data ? 'Sì' : 'No';
    if (typeof data === 'string' || typeof data === 'number') {
        const valueStr = String(data);
        // Handle date strings specifically for export
        if (/^\d{4}-\d{2}-\d{2}/.test(valueStr)) {
            const date = new Date(valueStr);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('it-IT');
            }
        }
        return valueStr;
    }
    
    if (Array.isArray(data)) {
        return data.map(getTextFromCell).join(' ');
    }
    if (React.isValidElement(data)) {
        const props = data.props as { children?: React.ReactNode };
        if (props && typeof props === 'object' && 'children' in props) {
            return getTextFromCell(props.children);
        }
// FIX: Added a return statement to handle React elements without children, ensuring the function always returns a string.
        return '';
    }

    // Fallback for other React nodes that might not have children but can be stringified
    if (typeof data === 'object') {
        return ''; // Avoids [object Object]
    }

    return String(data);
};


const ReportsScreen: React.FC<ReportsScreenProps> = ({ projectId }) => {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  
  // Data stores
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);

  // Filters state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [propertyId, setPropertyId] = useState('all');
  const [status, setStatus] = useState('all');
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());

  const [reportData, setReportData] = useState<any[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [grandTotals, setGrandTotals] = useState({ payments: 0, expenses: 0 });

  useEffect(() => {
    setProperties(dataService.getProperties(projectId));
    setContracts(dataService.getContracts(projectId));
    setTenants(dataService.getTenants(projectId));
    setDocuments(dataService.getDocuments(projectId));
    setPayments(dataService.getPayments(projectId));
    setExpenses(dataService.getExpenses(projectId));
    setMaintenances(dataService.getMaintenances(projectId));
  }, [projectId]);
  
  const getAvailableColumns = useMemo(() => {
    let baseColumns: { key: string, label: string }[] = [];
    let customFields: CustomField[] = [];

    switch(reportType) {
        case 'properties': 
            baseColumns = [
                { key: 'code', label: 'Codice' }, { key: 'name', label: 'Nome' }, { key: 'address', label: 'Indirizzo' },
                { key: 'type', label: 'Tipo' }, { key: 'surface', label: 'Superficie' }, { key: 'rooms', label: 'Locali' },
                { key: 'isRented', label: 'Affittato' }, { key: 'rentAmount', label: 'Canone' },
                 { key: 'creationDate', label: 'Data Creazione' },
            ];
            customFields = properties.flatMap(p => p.customFields);
            break;
        case 'contracts':
            baseColumns = [
                { key: 'propertyName', label: 'Immobile' }, { key: 'tenantName', label: 'Inquilino' },
                { key: 'startDate', label: 'Data Inizio' }, { key: 'endDate', label: 'Data Fine' },
                { key: 'rentAmount', label: 'Canone Mensile' },
            ];
            customFields = contracts.flatMap(c => c.customFields);
            break;
        case 'tenants':
             baseColumns = [
                { key: 'name', label: 'Nome' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Telefono' },
                { key: 'propertyName', label: 'Immobile Affittato' },
            ];
            customFields = tenants.flatMap(t => t.customFields);
            break;
        case 'documents':
             baseColumns = [
                { key: 'name', label: 'Nome Documento' }, { key: 'type', label: 'Tipo' },
                { key: 'uploadDate', label: 'Data Caricamento' }, { key: 'expiryDate', label: 'Data Scadenza' },
                { key: 'propertyName', label: 'Immobile' },
            ];
            customFields = documents.flatMap(d => d.customFields);
            break;
    }
    
    const uniqueCustomFieldLabels = [...new Set(customFields.map(cf => cf.label))];
    const customColumns = uniqueCustomFieldLabels.map(label => ({ key: `cf_${label}`, label }));

    return [...baseColumns, ...customColumns];
  }, [reportType, properties, contracts, tenants, documents]);


  useEffect(() => {
    if (!reportType) return;
    const isRegistry = reportTypesConfig.registry.some(r => r.id === reportType);
    if (isRegistry) {
        const baseKeys = getAvailableColumns.filter(c => !c.key.startsWith('cf_')).map(c => c.key);
        setSelectedColumns(new Set(baseKeys));
    }
  }, [reportType, getAvailableColumns]);
  
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setPropertyId('all');
    setStatus('all');
    setReportData([]);
    setIsGenerated(false);
    setGrandTotals({ payments: 0, expenses: 0 });
  };
  
  const handleSetReportType = (type: ReportType) => {
    setReportType(type);
    resetFilters();
  };

  const toggleColumn = (key: string) => {
    setSelectedColumns(prev => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        return newSet;
    });
  };
  
  const handleGenerateReport = () => {
    if (reportType === 'propertySummary') {
        const targetProperties = propertyId === 'all' ? properties : properties.filter(p => p.id === propertyId);
        let totalPayments = 0;
        let totalExpenses = 0;

        const aggregatedData = targetProperties.map(prop => {
            const propContracts = contracts.filter(c => c.propertyId === prop.id);
            const propTenants = tenants.filter(t => propContracts.some(c => c.tenantId === t.id));
            const propPayments = payments.filter(p => p.propertyId === prop.id);
            const propExpenses = expenses.filter(e => e.propertyId === prop.id);
            const propMaintenance = maintenances.filter(m => m.propertyId === prop.id);
            const propDeadlines = dataService.getDeadlines(projectId).filter(d => d.propertyId === prop.id);
            const propDocuments = documents.filter(d => d.propertyId === prop.id);
            
            const paymentSubtotal = propPayments.reduce((sum, p) => sum + p.amount, 0);
            const expenseSubtotal = propExpenses.reduce((sum, e) => sum + e.amount, 0) + propMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
            
            totalPayments += paymentSubtotal;
            totalExpenses += expenseSubtotal;

            return {
                property: prop,
                contracts: propContracts,
                tenants: propTenants,
                payments: propPayments,
                expenses: propExpenses,
                maintenances: propMaintenance,
                deadlines: propDeadlines,
                documents: propDocuments,
                paymentSubtotal,
                expenseSubtotal,
            };
        });

        setReportData(aggregatedData);
        setGrandTotals({ payments: totalPayments, expenses: totalExpenses });

    } else {
        let sourceData: any[] = [];
        
        const propertyMap = new Map(properties.map(p => [p.id, p.name]));
        const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

        // 1. Select and enrich source data
        switch(reportType) {
            case 'payments': sourceData = payments.map(p => ({...p, propertyName: propertyMap.get(p.propertyId)})); break;
            case 'expenses': sourceData = expenses.map(e => ({...e, propertyName: propertyMap.get(e.propertyId)})); break;
            case 'maintenance': sourceData = maintenances.map(m => ({...m, propertyName: propertyMap.get(m.propertyId)})); break;
            case 'properties': sourceData = properties; break;
            case 'contracts': 
                sourceData = contracts.map(c => ({
                    ...c,
                    propertyName: propertyMap.get(c.propertyId) || 'N/A',
                    tenantName: tenantMap.get(c.tenantId) || 'N/A',
                }));
                break;
            case 'tenants': 
                sourceData = tenants.map(t => {
                    const contract = contracts.find(c => c.tenantId === t.id);
                    return {
                        ...t,
                        propertyName: contract ? propertyMap.get(contract.propertyId) : 'N/A'
                    };
                });
                break;
            case 'documents':
                sourceData = documents.map(d => ({
                    ...d,
                    propertyName: propertyMap.get(d.propertyId) || 'N/A',
                }));
                break;
        }
        
        // 2. Filter data
        const isRegistryReport = reportTypesConfig.registry.some(r => r.id === reportType);
        const filtered = sourceData.filter(item => {
          const itemDateStr = item.date || item.requestDate || item.dueDate || item.uploadDate || item.startDate || item.creationDate;
          const itemDate = itemDateStr ? new Date(itemDateStr) : null;
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          
          if(end) end.setHours(23, 59, 59, 999);
          if(start) start.setHours(0,0,0,0);

          if (!isRegistryReport) {
              if (!itemDate) return false;
              if (start && itemDate < start) return false;
              if (end && itemDate > end) return false;
          }
          
          if (propertyId !== 'all' && item.propertyId !== propertyId) return false;
          if (!isRegistryReport && status !== 'all' && item.status !== status && item.category !== status) return false;
          
          return true;
        });

        // 3. Flatten data for registry reports to simplify rendering
        if (isRegistryReport) {
            const uniqueCustomFieldLabels = [...new Set(filtered.flatMap(item => item.customFields || []).map((cf: CustomField) => cf.label))];
            
            const flattenedData = filtered.map(item => {
                const newItem: any = {...item};
                uniqueCustomFieldLabels.forEach(label => {
                    const field = (item.customFields || []).find((cf: CustomField) => cf.label === label);
                    newItem[`cf_${label}`] = field ? field.value : undefined;
                });
                delete newItem.customFields;
                return newItem;
            });
            setReportData(flattenedData);
        } else {
            setReportData(filtered);
        }
    }
    setIsGenerated(true);
  };

  const getStatusOptions = () => {
    switch (reportType) {
      case 'payments': return Object.values(PaymentStatus);
      case 'expenses': return Object.values(ExpenseCategory);
      case 'maintenance': return Object.values(MaintenanceStatus);
      default: return [];
    }
  };
  
    const { columns, total } = useMemo(() => {
        if (!isGenerated || !reportType || reportType === 'propertySummary') {
            return { columns: [], total: 0 };
        }

        const safeDateRender = (value: any): string => {
            if (!value || typeof value !== 'string') return '';
            const date = new Date(value);
            if (isNaN(date.getTime())) return value;
            return date.toLocaleDateString('it-IT');
        };

        let activeColumns: Column<any>[] = [];
        
        if (reportTypesConfig.registry.some(r => r.id === reportType)) {
            activeColumns = getAvailableColumns
                .filter(col => selectedColumns.has(col.key))
                .map(col => ({
                    header: col.label,
                    accessor: col.key as any,
                    render: col.key.toLowerCase().includes('date') 
                        ? (row: any) => safeDateRender(row[col.key]) 
                        : undefined,
                }));
        } else {
            switch(reportType) {
                case 'payments':
                    activeColumns = [
                        { header: 'Data Scadenza', accessor: 'dueDate', render: (r) => safeDateRender(r.dueDate)},
                        { header: 'Immobile', accessor: 'propertyName' },
                        { header: 'Stato', accessor: 'status' },
                        { header: 'Importo', accessor: 'amount', render: (r) => `€${r.amount.toLocaleString('it-IT')}`},
                    ];
                    break;
                case 'expenses':
                    activeColumns = [
                        { header: 'Data', accessor: 'date', render: (r) => safeDateRender(r.date) },
                        { header: 'Immobile', accessor: 'propertyName' },
                        { header: 'Descrizione', accessor: 'description' },
                        { header: 'Categoria', accessor: 'category' },
                        { header: 'Importo', accessor: 'amount', render: (r) => `€${r.amount.toLocaleString('it-IT')}` },
                    ];
                    break;
                case 'maintenance':
                     activeColumns = [
                        { header: 'Data Richiesta', accessor: 'requestDate', render: (r) => safeDateRender(r.requestDate)},
                        { header: 'Immobile', accessor: 'propertyName' },
                        { header: 'Descrizione', accessor: 'description' },
                        { header: 'Stato', accessor: 'status' },
                        { header: 'Costo', accessor: 'cost', render: (r) => r.cost ? `€${r.cost.toLocaleString('it-IT')}` : 'N/D'},
                    ];
                    break;
            }
        }

        let tot = 0;
        if(reportTypesConfig.financial.some(r => r.id === reportType)) {
            const key = reportType === 'maintenance' ? 'cost' : 'amount';
            tot = reportData.reduce((sum, item) => sum + (Number(item?.[key]) || 0), 0);
        }
        return { columns: activeColumns, total: tot };

    }, [reportType, reportData, selectedColumns, getAvailableColumns, isGenerated]);
  
  
  const handleExportPdf = useCallback(() => {
    if (reportData.length === 0 || reportType === 'propertySummary') {
      alert("Nessun dato da esportare o tipo di report non supportato per PDF.");
      return;
    }
    const doc = new jsPDF();
    const allReportTypes = [...reportTypesConfig.financial, ...reportTypesConfig.registry, ...reportTypesConfig.summary];
    const reportName = allReportTypes.find(r => r.id === reportType)?.name || 'Report';

    doc.setFontSize(18);
    doc.text(`Report: ${reportName}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 30);

    const body = reportData.map(row => 
        columns.map(col => {
            const cellData = col.render ? col.render(row) : row[col.accessor];
            return getTextFromCell(cellData);
        })
    );

    autoTable(doc, {
      startY: 35,
      head: [columns.map(c => c.header)],
      body: body,
    });

    doc.save(`report_${reportType}.pdf`);
  }, [reportData, columns, reportType]);
  
  const isRegistryReport = reportType ? reportTypesConfig.registry.some(r => r.id === reportType) : false;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark flex items-center"><BarChart size={24} className="mr-3 text-primary"/>Report e Analisi</h1>
      </div>
      
      <Card className="p-6">
        <h2 className="text-lg font-bold text-dark mb-4">1. Seleziona il tipo di report</h2>
        <div className="space-y-4">
            <div>
                <h3 className="text-md font-semibold text-gray-600 mb-2 flex items-center"><Library size={18} className="mr-2" />Report Riepilogativi</h3>
                 <div className="flex flex-wrap gap-4">
                    {reportTypesConfig.summary.map(r => (
                        <button key={r.id} onClick={() => handleSetReportType(r.id as ReportType)} className={`flex items-center px-4 py-2 font-semibold rounded-lg border-2 transition-colors ${reportType === r.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'}`}>
                            <r.icon size={16} className="mr-2"/>{r.name}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-md font-semibold text-gray-600 mb-2 flex items-center"><DollarSign size={18} className="mr-2" />Report Finanziari</h3>
                <div className="flex flex-wrap gap-4">
                    {reportTypesConfig.financial.map(r => (
                        <button key={r.id} onClick={() => handleSetReportType(r.id as ReportType)} className={`flex items-center px-4 py-2 font-semibold rounded-lg border-2 transition-colors ${reportType === r.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'}`}>
                            <r.icon size={16} className="mr-2"/>{r.name}
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-md font-semibold text-gray-600 mb-2 flex items-center"><Database size={18} className="mr-2" />Report Anagrafiche</h3>
                <div className="flex flex-wrap gap-4">
                    {reportTypesConfig.registry.map(r => (
                        <button key={r.id} onClick={() => handleSetReportType(r.id as ReportType)} className={`flex items-center px-4 py-2 font-semibold rounded-lg border-2 transition-colors ${reportType === r.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'}`}>
                           <r.icon size={16} className="mr-2"/>{r.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </Card>

      {reportType && (
        <>
        {isRegistryReport && (
            <Card className="p-6">
                <h2 className="text-lg font-bold text-dark mb-4 flex items-center"><Settings2 size={20} className="mr-2"/>2. Seleziona Colonne</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2">
                    {getAvailableColumns.map(col => (
                        <label key={col.key} className="flex items-center p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100">
                           <input
                                type="checkbox"
                                checked={selectedColumns.has(col.key)}
                                onChange={() => toggleColumn(col.key)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-800">{col.label}</span>
                        </label>
                    ))}
                </div>
            </Card>
        )}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-dark mb-4 flex items-center"><Filter size={20} className="mr-2"/>
            {isRegistryReport ? '3. Applica i filtri' : '2. Applica i filtri'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {reportType !== 'propertySummary' && !isRegistryReport && (
                <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Da</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">A</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full input" />
                </div>
                </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Immobile</label>
              <select value={propertyId} onChange={e => setPropertyId(e.target.value)} className="mt-1 block w-full input">
                <option value="all">Tutti gli immobili</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {reportType !== 'propertySummary' && !isRegistryReport && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{reportType === 'expenses' ? 'Categoria' : 'Stato'}</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full input">
                    <option value="all">Tutti</option>
                    {getStatusOptions().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { handleSetReportType(reportType); }} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Resetta Filtri</button>
              <button 
                onClick={handleGenerateReport} 
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isRegistryReport && selectedColumns.size === 0}
              >
                Genera Report
              </button>
          </div>
        </Card>
        </>
      )}

      {isGenerated && reportType === 'propertySummary' ? (
        <div className="space-y-6">
            {reportData.map((data: AggregatedPropertyData) => (
                <PropertyReportCard key={data.property.id} data={data} />
            ))}
            <Card className="p-6 bg-blue-900 text-white">
                <h2 className="text-2xl font-bold mb-4">Riepilogo Totali</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                    <div className="bg-blue-800 p-4 rounded-lg">
                        <p className="font-semibold">Totale Pagamenti (Entrate)</p>
                        <p className="text-2xl font-bold text-green-300">€{grandTotals.payments.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-blue-800 p-4 rounded-lg">
                        <p className="font-semibold">Totale Spese</p>
                        <p className="text-2xl font-bold text-red-300">€{grandTotals.expenses.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </Card>
        </div>
      ) : isGenerated ? (
        <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-dark flex items-center"><FileSearch size={22} className="mr-2"/>Risultati del Report</h2>
                <div className="flex items-center gap-2">
                    <ExportButton data={reportData.map(row => {
                        const newRow: any = {};
                        columns.forEach(col => {
                           const cellData = col.render ? col.render(row) : row[col.accessor];
                           newRow[col.header] = getTextFromCell(cellData);
                        });
                        return newRow;
                    })} filename={`report_${reportType}.csv`} />
                    <button 
                        onClick={handleExportPdf}
                        className="flex items-center px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <FileTextIcon size={18} className="mr-2" />
                        Esporta PDF
                    </button>
                </div>
            </div>
          <InteractiveTable columns={columns} data={reportData} />
          <div className="mt-4 pt-4 border-t text-right">
              <span className="font-semibold text-dark">Voci trovate: {reportData.length}</span>
              {reportType && ['payments', 'expenses', 'maintenance'].includes(reportType) && (
                 <span className="ml-6 font-bold text-lg text-primary">Totale: €{total.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              )}
          </div>
        </Card>
      ) : (
        reportType && 
        <Card className="p-10 text-center text-gray-500 border-2 border-dashed">
            <p className="font-semibold">Imposta i filtri {isRegistryReport && 'e seleziona le colonne, poi '}clicca su "Genera Report" per visualizzare i dati.</p>
        </Card>
      )}
    </div>
  );
};

export default ReportsScreen;
