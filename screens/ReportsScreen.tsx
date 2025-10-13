
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import InteractiveTable, { Column } from '../components/ui/InteractiveTable';
import ExportButton from '../components/ui/ExportButton';
import * as dataService from '../services/dataService';
import { Payment, Expense, Maintenance, Property, PaymentStatus, ExpenseCategory, MaintenanceStatus, Contract, Tenant, Document, CustomField } from '../types';
import { BarChart, FileSearch, Filter, Settings2, Database, DollarSign, Building, Users, FileText as FileTextIcon, Wrench } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


type ReportCategory = 'financial' | 'registry';
type ReportType = 'payments' | 'expenses' | 'maintenance' | 'properties' | 'contracts' | 'tenants' | 'documents';

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
    ]
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

  useEffect(() => {
    setProperties(dataService.getProperties(projectId));
    setContracts(dataService.getContracts(projectId));
    setTenants(dataService.getTenants(projectId));
    setDocuments(dataService.getDocuments(projectId));
    setPayments(dataService.getPayments(projectId));
    setExpenses(dataService.getExpenses(projectId));
    setMaintenances(dataService.getMaintenances(projectId));
  }, [projectId]);

  useEffect(() => {
    if (!reportType) return;
    const isRegistry = reportTypesConfig.registry.some(r => r.id === reportType);
    if (isRegistry) {
        let baseColumns: { key: string, label: string }[] = [];
        switch(reportType) {
            case 'properties': 
                baseColumns = [
                    { key: 'code', label: 'Codice' }, { key: 'name', label: 'Nome' }, { key: 'address', label: 'Indirizzo' },
                    { key: 'type', label: 'Tipo' }, { key: 'isRented', label: 'Affittato' },
                ];
                break;
            case 'contracts':
                baseColumns = [
                    { key: 'propertyName', label: 'Immobile' }, { key: 'tenantName', label: 'Inquilino' },
                    { key: 'startDate', label: 'Data Inizio' }, { key: 'endDate', label: 'Data Fine' },
                    { key: 'rentAmount', label: 'Canone Mensile' },
                ];
                break;
            case 'tenants':
                baseColumns = [
                    { key: 'name', label: 'Nome' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Telefono' },
                    { key: 'propertyName', label: 'Immobile Affittato' },
                ];
                break;
            case 'documents':
                baseColumns = [
                    { key: 'name', label: 'Nome Documento' }, { key: 'type', label: 'Tipo' },
                    { key: 'uploadDate', label: 'Data Caricamento' }, { key: 'propertyName', label: 'Immobile' },
                ];
                break;
        }
        setSelectedColumns(new Set(baseColumns.map(c => c.key)));
    }
  }, [reportType]);
  
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setPropertyId('all');
    setStatus('all');
    setReportData([]);
    setIsGenerated(false);
    setSelectedColumns(new Set());
  };
  
  const handleSetReportType = (type: ReportType) => {
    setReportType(type);
    resetFilters();
  };

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
  
  const prepareRegistryData = useCallback((data: any[], type: ReportType) => {
    const propertyMap = new Map(properties.map(p => [p.id, p]));
    const tenantMap = new Map(tenants.map(t => [t.id, t]));
    const contractMap = new Map(contracts.map(c => [c.id, c]));

    return data.map(item => {
        const flatItem: any = { ...item };
        
        // Flatten custom fields into top-level properties
        if (item.customFields) {
            item.customFields.forEach((cf: CustomField) => {
                flatItem[`cf_${cf.label}`] = cf.value;
            });
        }

        // Add related data
        if (item.propertyId) {
            flatItem.propertyName = propertyMap.get(item.propertyId)?.name || 'N/A';
        }
        if (type === 'contracts' && item.tenantId) {
            flatItem.tenantName = tenantMap.get(item.tenantId)?.name || 'N/A';
        }
        if (type === 'tenants' && item.contractId) {
             const contract = contractMap.get(item.contractId);
             if (contract) {
                 flatItem.propertyName = propertyMap.get(contract.propertyId)?.name || 'N/A';
             }
        }
        
        // Remove complex objects to prevent rendering errors
        delete flatItem.customFields;
        delete flatItem.history;
        return flatItem;
    });
  }, [properties, tenants, contracts]);


  const handleGenerateReport = () => {
    let data: any[] = [];
    let isRegistryReport = reportTypesConfig.registry.some(r => r.id === reportType);

    if (reportType === 'payments') data = payments;
    else if (reportType === 'expenses') data = expenses;
    else if (reportType === 'maintenance') data = maintenances;
    else if (reportType === 'properties') data = properties;
    else if (reportType === 'contracts') data = contracts;
    else if (reportType === 'tenants') data = tenants;
    else if (reportType === 'documents') data = documents;

    const filtered = data.filter(item => {
      const itemDateStr = item.date || item.requestDate || item.dueDate || item.uploadDate || item.startDate || item.creationDate;
      if (!isRegistryReport && !itemDateStr) return true;
      
      const itemDate = new Date(itemDateStr);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      
      if(end) end.setHours(23, 59, 59, 999);
      if(start) start.setHours(0,0,0,0);

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;
      if (propertyId !== 'all' && item.propertyId !== propertyId) return false;
      if (!isRegistryReport && status !== 'all' && item.status !== status && item.category !== status) return false;
      
      return true;
    });

    const finalData = isRegistryReport ? prepareRegistryData(filtered, reportType!) : filtered;
    setReportData(finalData);
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

  const getTextFromCell = useCallback((cellData: any): string => {
    if (cellData === null || typeof cellData === 'undefined') return '';
    if (typeof cellData === 'boolean') return cellData ? 'Sì' : 'No';
    if (cellData instanceof Date && !isNaN(cellData.getTime())) return cellData.toLocaleDateString('it-IT');
    
    if (React.isValidElement(cellData)) {
        const props = cellData.props;
        if (typeof props === 'object' && props !== null && 'children' in props) {
          const { children } = props as { children?: React.ReactNode };
          if (Array.isArray(children)) {
              return children.map(child => getTextFromCell(child)).join('');
          }
          return getTextFromCell(children);
        }
        return '';
    }
    
    if (typeof cellData === 'object') {
      try {
        return JSON.stringify(cellData);
      } catch (e) {
        return '[Oggetto complesso]';
      }
    }
    
    return String(cellData);
  }, []);

  const renderRegistryCell = useCallback((data: any, key: string): React.ReactNode => {
    if (data === null || typeof data === 'undefined') return '';
    if (React.isValidElement(data)) return data;
    if (typeof data === 'boolean') return data ? 'Sì' : 'No';

    if (typeof data === 'string' && (key.toLowerCase().includes('date') || key.toLowerCase().includes('start') || key.toLowerCase().includes('end'))) {
        if (!data) return '';
        const date = new Date(data);
        if (!isNaN(date.getTime())) {
            const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            return utcDate.toLocaleDateString('it-IT');
        }
    }
    
    if (data instanceof Date) {
        return isNaN(data.getTime()) ? 'Data non valida' : data.toLocaleDateString('it-IT');
    }

    if (typeof data === 'object') {
        try { return JSON.stringify(data); } catch (e) { return '[Oggetto complesso]'; }
    }
    
    return String(data);
  }, []);


  const { columns, total } = useMemo(() => {
    let cols: Column<any>[] = [];
    let tot = 0;
    
    const getPropertyName = (id: string) => properties.find(p => p.id === id)?.name || 'N/A';
    
    if (reportTypesConfig.registry.some(r => r.id === reportType)) {
        cols = getAvailableColumns
            .filter(col => selectedColumns.has(col.key))
            .map(col => ({
                header: col.label,
                accessor: col.key,
                render: (row: any) => renderRegistryCell(row[col.key], col.key),
            }));
    } else {
       switch (reportType) {
         case 'payments':
            cols = [
            { header: 'Data Scadenza', accessor: 'dueDate', render: (row) => new Date(row.dueDate).toLocaleDateString('it-IT') },
            { header: 'Immobile', accessor: 'propertyId', render: (row) => getPropertyName(row.propertyId) },
            { header: 'Stato', accessor: 'status' },
            { header: 'Importo', accessor: 'amount', render: (row) => `€${row.amount.toLocaleString('it-IT')}`, className: 'text-right font-bold' },
            ];
            tot = reportData.reduce((sum, item) => sum + item.amount, 0);
            break;
         case 'expenses':
            cols = [
            { header: 'Data', accessor: 'date', render: (row) => new Date(row.date).toLocaleDateString('it-IT') },
            { header: 'Immobile', accessor: 'propertyId', render: (row) => getPropertyName(row.propertyId) },
            { header: 'Descrizione', accessor: 'description' },
            { header: 'Categoria', accessor: 'category' },
            { header: 'Importo', accessor: 'amount', render: (row) => `€${row.amount.toLocaleString('it-IT')}`, className: 'text-right font-bold' },
            ];
            tot = reportData.reduce((sum, item) => sum + item.amount, 0);
            break;
         case 'maintenance':
            cols = [
            { header: 'Data Richiesta', accessor: 'requestDate', render: (row) => new Date(row.requestDate).toLocaleDateString('it-IT') },
            { header: 'Immobile', accessor: 'propertyId', render: (row) => getPropertyName(row.propertyId) },
            { header: 'Descrizione', accessor: 'description' },
            { header: 'Stato', accessor: 'status' },
            { header: 'Costo', accessor: 'cost', render: (row) => row.cost ? `€${row.cost.toLocaleString('it-IT')}` : '---', className: 'text-right font-bold' },
            ];
            tot = reportData.reduce((sum, item) => sum + (item.cost || 0), 0);
            break;
        }
    }
    return { columns: cols, total: tot };
  }, [reportType, reportData, properties, selectedColumns, getAvailableColumns, renderRegistryCell]);
  
  const preparedExportData = useMemo(() => {
    if (!isGenerated || reportData.length === 0) return [];
    
    return reportData.map(row => {
        const newRow: any = {};
        columns.forEach(col => {
            const header = col.header;
            const cellData = col.render ? col.render(row) : row[col.accessor as any];
            newRow[header] = getTextFromCell(cellData);
        });
        return newRow;
    });
  }, [reportData, columns, isGenerated, getTextFromCell]);

  const handleExportPdf = useCallback(() => {
    if (reportData.length === 0) {
      alert("Nessun dato da esportare.");
      return;
    }
    const doc = new jsPDF();
    const allReportTypes = [...reportTypesConfig.financial, ...reportTypesConfig.registry];
    const reportName = allReportTypes.find(r => r.id === reportType)?.name || 'Report';

    doc.setFontSize(18);
    doc.text(`Report: ${reportName}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generato il: ${new Date().toLocaleDateString('it-IT')}`, 14, 30);

    autoTable(doc, {
      startY: 35,
      head: [columns.map(c => c.header)],
      body: reportData.map(row => 
        columns.map(col => {
            const cellData = col.render ? col.render(row) : row[col.accessor as any];
            return getTextFromCell(cellData);
        })
      ),
    });

    doc.save(`report_${reportType}.pdf`);
  }, [reportData, columns, reportType, getTextFromCell]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark flex items-center"><BarChart size={24} className="mr-3 text-primary"/>Report e Analisi</h1>
      </div>
      
      <Card className="p-6">
        <h2 className="text-lg font-bold text-dark mb-4">1. Seleziona il tipo di report</h2>
        <div className="space-y-4">
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
        {reportTypesConfig.registry.some(r => r.id === reportType) && (
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
            {reportTypesConfig.registry.some(r => r.id === reportType) ? '3. Applica i filtri' : '2. Applica i filtri'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Da</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">A</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Immobile</label>
              <select value={propertyId} onChange={e => setPropertyId(e.target.value)} className="mt-1 block w-full input">
                <option value="all">Tutti gli immobili</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {!reportTypesConfig.registry.some(r => r.id === reportType) && (
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
                disabled={reportTypesConfig.registry.some(r => r.id === reportType) && selectedColumns.size === 0}
              >
                Genera Report
              </button>
          </div>
        </Card>
        </>
      )}

      {isGenerated ? (
        <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-dark flex items-center"><FileSearch size={22} className="mr-2"/>Risultati del Report</h2>
                <div className="flex items-center gap-2">
                    <ExportButton data={preparedExportData} filename={`report_${reportType}.csv`} />
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
            <p className="font-semibold">Imposta i filtri {reportTypesConfig.registry.some(r => r.id === reportType) && 'e seleziona le colonne, poi '}clicca su "Genera Report" per visualizzare i dati.</p>
        </Card>
      )}
    </div>
  );
};

export default ReportsScreen;