export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'Appartamento' | 'Villa' | 'Ufficio' | 'Negozio';
  imageUrl: string;
  surface: number;
  rooms: number;
  isRented: boolean;
  rentAmount: number | null;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  contractId: string;
}

export interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate:string;
  rentAmount: number;
  documentUrl: string;
}

export enum DeadlineType {
  RENT = 'Affitto',
  TAX = 'Tassa',
  MAINTENANCE = 'Manutenzione',
  CONTRACT = 'Contratto'
}

export interface Deadline {
  id: string;
  propertyId: string;
  title: string;
  dueDate: string;
  type: DeadlineType;
  isCompleted: boolean;
}

export interface Document {
  id: string;
  propertyId: string;
  name: string;
  type: 'Contratto' | 'Planimetria' | 'APE' | 'Fattura' | 'Altro';
  uploadDate: string;
  fileUrl: string;
}

export enum MaintenanceStatus {
  REQUESTED = 'Richiesta',
  IN_PROGRESS = 'In Corso',
  COMPLETED = 'Completata'
}

export interface Maintenance {
  id: string;
  propertyId: string;
  description: string;
  status: MaintenanceStatus;
  requestDate: string;
  cost: number | null;
}

export enum ExpenseCategory {
  CONDOMINIUM = 'Condominio',
  UTILITIES = 'Utenze',
  TAXES = 'Tasse',
  MAINTENANCE = 'Manutenzione',
  OTHER = 'Altro'
}

export interface Expense {
  id: string;
  propertyId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  providerUrl?: string;
  invoiceUrl?: string;
}

export enum PaymentStatus {
  PAID = 'Pagato',
  PENDING = 'In Attesa',
  LATE = 'In Ritardo',
}

export interface Payment {
  id: string;
  contractId: string;
  propertyId: string;
  amount: number;
  paymentDate: string | null;
  referenceMonth: number;
  referenceYear: number;
  status: PaymentStatus;
}

export interface User {
  id: string;
  name: string;
  email: string;
}