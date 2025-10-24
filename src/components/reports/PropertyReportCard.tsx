
import React, { useState } from 'react';
import { Property, Tenant, Contract, Payment, Expense, Maintenance, Deadline, Document } from '@/types';
import Card from '@/components/ui/Card';
import { ChevronDown, Users, DollarSign, Wrench, Calendar, FileText } from 'lucide-react';

export interface AggregatedPropertyData {
    property: Property;
    tenants: Tenant[];
    contracts: Contract[];
    payments: Payment[];
    expenses: Expense[];
    maintenances: Maintenance[];
    deadlines: Deadline[];
    documents: Document[];
    paymentSubtotal: number;
    expenseSubtotal: number;
}

interface PropertyReportCardProps {
  data: AggregatedPropertyData;
}

const ReportSection: React.FC<{
    title: string;
    count: number;
    icon: React.ElementType;
    children: React.ReactNode;
}> = ({ title, count, icon: Icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-t">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
            >
                <div className="flex items-center gap-3">
                    <Icon className="text-primary" size={20} />
                    <span className="font-semibold text-dark">{title}</span>
                    <span className="text-sm bg-gray-200 text-gray-700 font-bold px-2 py-0.5 rounded-full">{count}</span>
                </div>
                <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                <div className="p-4 pt-0 text-gray-700 bg-gray-50">
                    {count > 0 ? children : <p className="text-center text-sm">Nessun dato disponibile.</p>}
                </div>
            </div>
        </div>
    );
};


const PropertyReportCard: React.FC<PropertyReportCardProps> = ({ data }) => {
    const { property, tenants, contracts, payments, expenses, maintenances, deadlines, documents, paymentSubtotal, expenseSubtotal } = data;
    
    const allExpenses = [
        ...expenses.map(e => ({...e, type: e.category})),
        ...maintenances.filter(m => m.cost).map(m => ({ id: m.id, date: m.completionDate || m.requestDate, description: m.description, amount: m.cost, type: 'Manutenzione' }))
    ];

    return (
        <Card>
            <div className="p-6 bg-gray-50 rounded-t-xl">
                <p className="text-sm font-semibold text-primary">{property.code}</p>
                <h2 className="text-2xl font-bold text-dark">{property.name}</h2>
                <p className="text-gray-600">{property.address}</p>
            </div>
            
            <ReportSection title="Inquilini e Contratti" count={contracts.length} icon={Users}>
                {contracts.map(c => {
                    const tenant = tenants.find(t => t.id === c.tenantId);
                    return (
                        <div key={c.id} className="p-3 bg-white rounded-md mb-2 shadow-sm">
                            <p><strong>Inquilino:</strong> {tenant?.name || 'N/A'}</p>
                            <p><strong>Contratto:</strong> {new Date(c.startDate).toLocaleDateString('it-IT')} - {new Date(c.endDate).toLocaleDateString('it-IT')}</p>
                            <p><strong>Canone:</strong> €{c.rentAmount.toLocaleString('it-IT')}</p>
                        </div>
                    );
                })}
            </ReportSection>

            <ReportSection title="Pagamenti (Entrate)" count={payments.length} icon={DollarSign}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white"><tr className="text-left">
                            <th className="p-2">Data Scad.</th><th className="p-2">Rif.</th><th className="p-2">Stato</th><th className="p-2 text-right">Importo</th>
                        </tr></thead>
                        <tbody>{payments.map(p => (
                            <tr key={p.id} className="border-t">
                                <td className="p-2">{new Date(p.dueDate).toLocaleDateString('it-IT')}</td>
                                <td className="p-2">{p.referenceMonth}/{p.referenceYear}</td>
                                <td className="p-2">{p.status}</td>
                                <td className="p-2 text-right">€{p.amount.toLocaleString('it-IT')}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
                <div className="text-right font-bold p-2 mt-2 bg-blue-100 text-blue-800 rounded-md">
                    Subtotale Pagamenti: €{paymentSubtotal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </div>
            </ReportSection>
            
            <ReportSection title="Spese" count={allExpenses.length} icon={DollarSign}>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white"><tr className="text-left">
                            <th className="p-2">Data</th><th className="p-2">Descrizione</th><th className="p-2">Categoria</th><th className="p-2 text-right">Importo</th>
                        </tr></thead>
                        <tbody>{allExpenses.map(e => (
                            <tr key={e.id} className="border-t">
                                <td className="p-2">{new Date(e.date).toLocaleDateString('it-IT')}</td>
                                <td className="p-2">{e.description}</td>
                                <td className="p-2">{e.type}</td>
                                <td className="p-2 text-right">€{e.amount?.toLocaleString('it-IT')}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                </div>
                <div className="text-right font-bold p-2 mt-2 bg-red-100 text-red-800 rounded-md">
                    Subtotale Spese: €{expenseSubtotal.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </div>
            </ReportSection>
            
             <ReportSection title="Scadenze" count={deadlines.length} icon={Calendar}>
                <ul className="space-y-1">
                    {deadlines.map(d => (
                        <li key={d.id} className="flex justify-between p-2 bg-white rounded">
                            <span>{d.title}</span>
                            <span>{new Date(d.dueDate).toLocaleDateString('it-IT')}</span>
                        </li>
                    ))}
                </ul>
            </ReportSection>
            
            <ReportSection title="Documenti" count={documents.length} icon={FileText}>
                 <ul className="space-y-1">
                    {documents.map(d => (
                        <li key={d.id} className="flex justify-between p-2 bg-white rounded">
                            <span>{d.name}</span>
                            <span>({d.type})</span>
                        </li>
                    ))}
                </ul>
            </ReportSection>

        </Card>
    );
};

export default PropertyReportCard;
