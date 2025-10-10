
import { Property, Tenant, Contract, Deadline, Document, Maintenance, Expense, DeadlineType, MaintenanceStatus, ExpenseCategory, Payment, PaymentStatus, User } from './types';

export const MOCK_USER: User = {
  name: 'Giovanni Riva',
  email: 'giovanni.riva@email.com',
};

export const MOCK_PROPERTIES: Property[] = [
  { id: 'p1', name: 'Appartamento Centrale', address: 'Via Roma 1, Milano', type: 'Appartamento', imageUrl: 'https://picsum.photos/seed/p1/600/400', surface: 80, rooms: 3, isRented: true, rentAmount: 1200 },
  { id: 'p2', name: 'Villa con Giardino', address: 'Via Verdi 15, Roma', type: 'Villa', imageUrl: 'https://picsum.photos/seed/p2/600/400', surface: 250, rooms: 7, isRented: true, rentAmount: 3500 },
  { id: 'p3', name: 'Ufficio Moderno', address: 'Piazza Duomo 10, Milano', type: 'Ufficio', imageUrl: 'https://picsum.photos/seed/p3/600/400', surface: 120, rooms: 4, isRented: false, rentAmount: null },
  { id: 'p4', name: 'Negozio in Centro', address: 'Corso Vittorio Emanuele 5, Torino', type: 'Negozio', imageUrl: 'https://picsum.photos/seed/p4/600/400', surface: 60, rooms: 1, isRented: true, rentAmount: 2000 },
];

export const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'Mario Rossi', email: 'mario.rossi@email.com', phone: '3331234567', contractId: 'c1' },
  { id: 't2', name: 'Laura Bianchi', email: 'laura.bianchi@email.com', phone: '3337654321', contractId: 'c2' },
  { id: 't3', name: 'Paolo Verdi', email: 'paolo.verdi@email.com', phone: '3339876543', contractId: 'c4' },
];

export const MOCK_CONTRACTS: Contract[] = [
  { id: 'c1', propertyId: 'p1', tenantId: 't1', startDate: '2023-01-01', endDate: '2026-12-31', rentAmount: 1200, documentUrl: '#' },
  { id: 'c2', propertyId: 'p2', tenantId: 't2', startDate: '2022-06-01', endDate: '2026-05-31', rentAmount: 3500, documentUrl: '#' },
  { id: 'c4', propertyId: 'p4', tenantId: 't3', startDate: '2024-03-01', endDate: '2030-02-28', rentAmount: 2000, documentUrl: '#' },
];

export const MOCK_DEADLINES: Deadline[] = [
  { id: 'd1', propertyId: 'p1', title: 'Pagamento Affitto - Mario Rossi', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], type: DeadlineType.RENT, isCompleted: false },
  { id: 'd2', propertyId: 'p2', title: 'Pagamento TARI', dueDate: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString().split('T')[0], type: DeadlineType.TAX, isCompleted: false },
  { id: 'd3', propertyId: 'p1', title: 'Manutenzione Caldaia', dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0], type: DeadlineType.MAINTENANCE, isCompleted: true },
  { id: 'd4', propertyId: 'p2', title: 'Rinnovo Contratto - Laura Bianchi', dueDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString().split('T')[0], type: DeadlineType.CONTRACT, isCompleted: false },
];

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'doc1', propertyId: 'p1', name: 'Contratto Affitto Rossi.pdf', type: 'Contratto', uploadDate: '2023-01-01', fileUrl: '#' },
  { id: 'doc2', propertyId: 'p1', name: 'Planimetria Catastale.pdf', type: 'Planimetria', uploadDate: '2022-12-15', fileUrl: '#' },
  { id: 'doc3', propertyId: 'p2', name: 'Certificazione Energetica (APE).pdf', type: 'APE', uploadDate: '2022-05-20', fileUrl: '#' },
  { id: 'doc4', propertyId: 'p2', name: 'Fattura Giardiniere.pdf', type: 'Fattura', uploadDate: '2024-05-10', fileUrl: '#' },
];

export const MOCK_MAINTENANCE: Maintenance[] = [
    {id: 'm1', propertyId: 'p1', description: 'Perdita rubinetto cucina', status: MaintenanceStatus.COMPLETED, requestDate: '2024-06-20', cost: 80},
    {id: 'm2', propertyId: 'p2', description: 'Potatura siepe giardino', status: MaintenanceStatus.IN_PROGRESS, requestDate: '2024-07-01', cost: null},
    {id: 'm3', propertyId: 'p4', description: 'Vetrina negozio incrinata', status: MaintenanceStatus.REQUESTED, requestDate: '2024-07-15', cost: null},
];

export const MOCK_EXPENSES: Expense[] = [
    {id: 'e1', propertyId: 'p1', description: 'Spese condominiali Q2', amount: 350, category: ExpenseCategory.CONDOMINIUM, date: '2024-07-01'},
    {id: 'e2', propertyId: 'p2', description: 'TARI 2024', amount: 600, category: ExpenseCategory.TAXES, date: '2024-06-15'},
    {id: 'e3', propertyId: 'p1', description: 'Riparazione caldaia', amount: 150, category: ExpenseCategory.MAINTENANCE, date: '2024-05-28'},
    {id: 'e4', propertyId: 'p4', description: 'Bolletta luce aree comuni', amount: 120, category: ExpenseCategory.UTILITIES, date: '2024-07-10'},
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay1', contractId: 'c1', propertyId: 'p1', amount: 1200, paymentDate: '2024-07-01', referenceMonth: 7, referenceYear: 2024, status: PaymentStatus.PAID },
  { id: 'pay2', contractId: 'c2', propertyId: 'p2', amount: 3500, paymentDate: '2024-07-03', referenceMonth: 7, referenceYear: 2024, status: PaymentStatus.PAID },
  { id: 'pay3', contractId: 'c4', propertyId: 'p4', amount: 2000, paymentDate: null, referenceMonth: 7, referenceYear: 2024, status: PaymentStatus.LATE },
  { id: 'pay4', contractId: 'c1', propertyId: 'p1', amount: 1200, paymentDate: null, referenceMonth: 8, referenceYear: 2024, status: PaymentStatus.PENDING },
  { id: 'pay5', contractId: 'c2', propertyId: 'p2', amount: 3500, paymentDate: null, referenceMonth: 8, referenceYear: 2024, status: PaymentStatus.PENDING },
  { id: 'pay6', contractId: 'c1', propertyId: 'p1', amount: 1200, paymentDate: '2024-06-02', referenceMonth: 6, referenceYear: 2024, status: PaymentStatus.PAID },
];
