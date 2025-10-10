export interface User {
  id: string;
  name: string;
  email: string;
}

export enum PropertyType {
  APARTMENT = 'Appartamento',
  VILLA = 'Villa',
  OFFICE = 'Ufficio',
  SHOP = 'Negozio',
  GARAGE = 'Garage',
}

export interface Property {
  id: string;
  code: string;
  name: string;
  address: string;
  type: PropertyType;
  surface: number; // in square meters
  rooms: number;
  isRented: boolean;
  rentAmount?: number;
  imageUrl: string;
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
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  rentAmount: number;
  documentUrl: string;
}

export enum DeadlineType {
  RENT = 'Affitto',
  TAX = 'Tasse',
  MAINTENANCE = 'Manutenzione',
  CONTRACT = 'Contratto',
  DOCUMENT = 'Documento',
  OTHER = 'Altro',
}

export interface Deadline {
  id: string;
  propertyId: string;
  title: string;
  dueDate: string; // ISO date string
  isCompleted: boolean;
  type: DeadlineType;
  documentId?: string;
}

export enum MaintenanceStatus {
  REQUESTED = 'Richiesta',
  IN_PROGRESS = 'In Corso',
  COMPLETED = 'Completata',
}

export interface Maintenance {
  id: string;
  propertyId: string;
  description: string;
  status: MaintenanceStatus;
  requestDate: string; // ISO date string
  completionDate?: string; // ISO date string
  cost: number | null;
}

export enum ExpenseCategory {
  CONDOMINIUM = 'Condominio',
  UTILITIES = 'Utenze',
  TAXES = 'Tasse',
  MAINTENANCE = 'Manutenzione',
  OTHER = 'Altro',
}

export interface Expense {
  id: string;
  propertyId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string
  providerUrl?: string;
  invoiceUrl?: string;
}

export interface Document {
    id: string;
    name: string;
    propertyId: string;
    type: string;
    uploadDate: string; // ISO date string
    fileUrl: string;
    expiryDate?: string;
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
  paymentDate: string | null; // ISO date string
  dueDate: string; // ISO date string
  referenceMonth: number;
  referenceYear: number;
  status: PaymentStatus;
}