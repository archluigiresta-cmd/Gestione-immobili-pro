import { Property, PropertyType, Tenant, Contract, Payment, PaymentStatus, User, Deadline, DeadlineType, Maintenance, MaintenanceStatus, Expense, ExpenseCategory, Document } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Luigi Resta', email: 'arch.luigiresta@gmail.com' },
  { id: 'user-2', name: 'Collaboratore Demo', email: 'collaboratore@email.com' },
];

export const MOCK_PROPERTIES: Property[] = [
  { id: 'prop-1', code: 'IMM-001', name: 'Villa Paradiso', address: 'Via Roma 1, Milano', type: PropertyType.VILLA, surface: 250, rooms: 7, isRented: true, rentAmount: 3000, imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80' },
  { id: 'prop-2', code: 'IMM-002', name: 'Appartamento Centrale', address: 'Corso Buenos Aires 10, Milano', type: PropertyType.APARTMENT, surface: 80, rooms: 3, isRented: true, rentAmount: 1200, imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80' },
  { id: 'prop-3', code: 'IMM-003', name: 'Ufficio Moderno', address: 'Piazza Duomo 5, Milano', type: PropertyType.OFFICE, surface: 120, rooms: 4, isRented: false, imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80' },
];

export const MOCK_CONTRACTS: Contract[] = [
  { id: 'contract-1', propertyId: 'prop-1', tenantId: 'tenant-1', startDate: '2023-01-01', endDate: '2024-12-31', rentAmount: 3000, documentUrl: '#' },
  { id: 'contract-2', propertyId: 'prop-2', tenantId: 'tenant-2', startDate: '2022-06-01', endDate: '2024-05-31', rentAmount: 1200, documentUrl: '#' },
];

export const MOCK_TENANTS: Tenant[] = [
  { id: 'tenant-1', name: 'Luigi Verdi', email: 'luigi.verdi@email.com', phone: '3331234567', contractId: 'contract-1' },
  { id: 'tenant-2', name: 'Anna Bianchi', email: 'anna.bianchi@email.com', phone: '3337654321', contractId: 'contract-2' },
];

export const MOCK_DEADLINES: Deadline[] = [
  { id: 'deadline-1', propertyId: 'prop-1', title: 'Pagamento IMU', dueDate: '2024-06-16', isCompleted: false, type: DeadlineType.TAX },
  { id: 'deadline-2', propertyId: 'prop-2', title: 'Controllo caldaia', dueDate: '2024-09-30', isCompleted: false, type: DeadlineType.MAINTENANCE },
  { id: 'deadline-3', propertyId: 'prop-1', title: 'Rinnovo contratto', dueDate: '2024-11-01', isCompleted: false, type: DeadlineType.CONTRACT },
  { id: 'deadline-4', propertyId: 'prop-2', title: 'Pagamento TARI', dueDate: '2024-07-20', isCompleted: true, type: DeadlineType.TAX },
  { id: 'deadline-5', propertyId: 'prop-3', documentId: 'doc-4', title: 'Scadenza documento: Polizza Assicurativa Ufficio', dueDate: '2025-01-31', isCompleted: false, type: DeadlineType.DOCUMENT },
];

export const MOCK_MAINTENANCES: Maintenance[] = [
    { id: 'maint-1', propertyId: 'prop-1', description: 'Riparazione perdita rubinetto cucina', status: MaintenanceStatus.COMPLETED, requestDate: '2024-04-10', completionDate: '2024-04-12', cost: 150 },
    { id: 'maint-2', propertyId: 'prop-2', description: 'Sostituzione condizionatore', status: MaintenanceStatus.IN_PROGRESS, requestDate: '2024-05-20', cost: null },
    { id: 'maint-3', propertyId: 'prop-1', description: 'Tinteggiatura pareti soggiorno', status: MaintenanceStatus.REQUESTED, requestDate: '2024-05-28', cost: null },
];

export const MOCK_EXPENSES: Expense[] = [
    { id: 'exp-1', propertyId: 'prop-1', description: 'Spese condominiali Aprile', amount: 250, category: ExpenseCategory.CONDOMINIUM, date: '2024-04-05' },
    { id: 'exp-2', propertyId: 'prop-2', description: 'Bolletta luce', amount: 85.50, category: ExpenseCategory.UTILITIES, date: '2024-04-15', providerUrl: '#' },
    { id: 'exp-3', propertyId: 'prop-1', description: 'Tassa Rifiuti (TARI)', amount: 320, category: ExpenseCategory.TAXES, date: '2024-04-20', invoiceUrl: '#' },
    { id: 'exp-4', propertyId: 'prop-2', description: 'Riparazione caldaia', amount: 200, category: ExpenseCategory.MAINTENANCE, date: '2024-03-18' },
];

export const MOCK_DOCUMENTS: Document[] = [
    { id: 'doc-1', name: 'Contratto affitto Verdi', propertyId: 'prop-1', type: 'Contratto', uploadDate: '2023-01-05', fileUrl: '#' },
    { id: 'doc-2', name: 'Planimetria Villa Paradiso', propertyId: 'prop-1', type: 'Planimetria', uploadDate: '2022-11-20', fileUrl: '#' },
    { id: 'doc-3', name: 'Certificazione energetica Apt. Centrale', propertyId: 'prop-2', type: 'Certificazione', uploadDate: '2022-05-10', fileUrl: '#' },
    { id: 'doc-4', name: 'Polizza Assicurativa Ufficio', propertyId: 'prop-3', type: 'Assicurazione', uploadDate: '2024-01-20', fileUrl: '#', expiryDate: '2025-01-31' },
];

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'pay-1', contractId: 'contract-1', propertyId: 'prop-1', amount: 3000, dueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, paymentDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-03`, referenceMonth: currentMonth, referenceYear: currentYear, status: PaymentStatus.PAID },
  { id: 'pay-2', contractId: 'contract-2', propertyId: 'prop-2', amount: 1200, dueDate: `${currentYear}-${String(currentMonth).padStart(2, '0')}-05`, paymentDate: null, referenceMonth: currentMonth, referenceYear: currentYear, status: PaymentStatus.PENDING },
  { id: 'pay-3', contractId: 'contract-1', propertyId: 'prop-1', amount: 3000, dueDate: `${currentYear}-${String(currentMonth-1).padStart(2, '0')}-05`, paymentDate: `${currentYear}-${String(currentMonth-1).padStart(2, '0')}-01`, referenceMonth: currentMonth-1, referenceYear: currentYear, status: PaymentStatus.PAID },
  { id: 'pay-4', contractId: 'contract-2', propertyId: 'prop-2', amount: 1200, dueDate: `${currentYear}-${String(currentMonth-1).padStart(2, '0')}-05`, paymentDate: null, referenceMonth: currentMonth-1, referenceYear: currentYear, status: PaymentStatus.LATE },
];