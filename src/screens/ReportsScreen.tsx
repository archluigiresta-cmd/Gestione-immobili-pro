import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import * as dataService from '@/services/dataService';
import { Property, Tenant, Contract, Payment, Expense, Maintenance, Deadline, Document } from '@/types';
import PropertyReportCard, { AggregatedPropertyData } from '@/components/reports/PropertyReportCard';

interface ReportsScreenProps {
  projectId: string;
}

const ReportsScreen: React.FC<ReportsScreenProps> = ({ projectId }) => {
    const [aggregatedData, setAggregatedData] = useState<AggregatedPropertyData[]>([]);
    
    useEffect(() => {
        const properties = dataService.getProperties(projectId);
        const tenants = dataService.getTenants(projectId);
        const contracts = dataService.getContracts(projectId);
        const payments = dataService.getPayments(projectId);
        const expenses = dataService.getExpenses(projectId);
        const maintenances = dataService.getMaintenances(projectId);
        const deadlines = dataService.getDeadlines(projectId);
        const documents = dataService.getDocuments(projectId);

        const data: AggregatedPropertyData[] = properties.map(property => {
            const propertyPayments = payments.filter(p => p.propertyId === property.id);
            const propertyExpenses = expenses.filter(e => e.propertyId === property.id);
            const propertyMaintenances = maintenances.filter(m => m.propertyId === property.id);
            
            const paymentSubtotal = propertyPayments.reduce((sum, p) => sum + p.amount, 0);
            const expenseSubtotal = propertyExpenses.reduce((sum, e) => sum + e.amount, 0) + 
                                  propertyMaintenances.reduce((sum, m) => sum + (m.cost || 0), 0);

            return {
                property,
                tenants: tenants.filter(t => contracts.some(c => c.propertyId === property.id && c.tenantId === t.id)),
                contracts: contracts.filter(c => c.propertyId === property.id),
                payments: propertyPayments,
                expenses: propertyExpenses,
                maintenances: propertyMaintenances,
                deadlines: deadlines.filter(d => d.propertyId === property.id),
                documents: documents.filter(doc => doc.propertyId === property.id),
                paymentSubtotal,
                expenseSubtotal,
            };
        });
        
        setAggregatedData(data);
    }, [projectId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark">Report di Riepilogo per Immobile</h1>
      <p className="text-gray-600">
        Questa sezione fornisce un riepilogo completo per ogni immobile nel progetto. Espandi le sezioni per visualizzare i dettagli.
      </p>

      {aggregatedData.length > 0 ? (
          <div className="space-y-8">
              {aggregatedData.map(data => (
                  <PropertyReportCard key={data.property.id} data={data} />
              ))}
          </div>
      ) : (
          <Card className="p-6">
            <p className="text-center text-gray-500">Nessun immobile trovato in questo progetto per generare un report.</p>
          </Card>
      )}
    </div>
  );
};

export default ReportsScreen;
