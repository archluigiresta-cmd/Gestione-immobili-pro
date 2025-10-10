
import React from 'react';
import Card from '../components/ui/Card';
import { MOCK_PAYMENTS, MOCK_PROPERTIES, MOCK_TENANTS, MOCK_CONTRACTS } from '../constants';
import { Payment, PaymentStatus } from '../types';
import { CheckCircle, Clock, AlertCircle, PlusCircle } from 'lucide-react';

const PaymentsScreen: React.FC = () => {
    const getTenantNameByContract = (contractId: string) => {
        const contract = MOCK_CONTRACTS.find(c => c.id === contractId);
        if (!contract) return 'N/A';
        return MOCK_TENANTS.find(t => t.id === contract.tenantId)?.name || 'N/A';
    };

    const getPropertyName = (id: string) => MOCK_PROPERTIES.find(p => p.id === id)?.name || 'N/A';
  
    const getStatusInfo = (status: PaymentStatus) => {
        switch(status) {
            case PaymentStatus.PAID: 
                return { 
                    badge: 'bg-green-100 text-green-800', 
                    icon: <CheckCircle size={16} className="text-green-600" /> 
                };
            case PaymentStatus.PENDING: 
                return { 
                    badge: 'bg-blue-100 text-blue-800',
                    icon: <Clock size={16} className="text-blue-600" />
                };
            case PaymentStatus.LATE: 
                return {
                    badge: 'bg-red-100 text-red-800',
                    icon: <AlertCircle size={16} className="text-red-600" />
                };
            default: 
                return {
                    badge: 'bg-gray-100 text-gray-800',
                    icon: null
                };
        }
    }

    // Sort payments by year and month descending
    const sortedPayments = [...MOCK_PAYMENTS].sort((a, b) => {
        if (a.referenceYear !== b.referenceYear) {
            return b.referenceYear - a.referenceYear;
        }
        return b.referenceMonth - a.referenceMonth;
    });

    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dark">Registro Pagamenti e Entrate</h1>
          <button
            onClick={() => alert("Funzionalità 'Registra Pagamento' da implementare.")}
            className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
          >
            <PlusCircle size={18} className="mr-2" />
            Registra Pagamento
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-600">Immobile</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Inquilino</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Riferimento</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Data Pagamento</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Importo</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Stato</th>
              </tr>
            </thead>
            <tbody>
              {sortedPayments.map((payment: Payment) => {
                const statusInfo = getStatusInfo(payment.status);
                return (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-dark font-medium">{getPropertyName(payment.propertyId)}</td>
                        <td className="p-3 text-gray-700">{getTenantNameByContract(payment.contractId)}</td>
                        <td className="p-3 text-gray-700">{`${payment.referenceMonth.toString().padStart(2, '0')}/${payment.referenceYear}`}</td>
                        <td className="p-3 text-gray-700">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('it-IT') : '---'}</td>
                        <td className="p-3 text-gray-900 font-bold text-right">€{payment.amount.toLocaleString('it-IT')}</td>
                        <td className="p-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.badge}`}>
                                {statusInfo.icon && <span className="mr-1.5">{statusInfo.icon}</span>}
                                {payment.status}
                            </span>
                        </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
};

export default PaymentsScreen;
