export interface HistoryLog {
  id: string;
  timestamp: string; // ISO date string
  userId: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum ProjectMemberRole {
  OWNER = 'Proprietario',
  EDITOR = 'Editor',
  VIEWER = 'Visualizzatore',
}

export interface ProjectMember {
  userId: string;
  role: ProjectMemberRole;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  members: ProjectMember[];
}


export enum PropertyType {
  APARTMENT = 'Appartamento',
  VILLA = 'Villa',
  OFFICE = 'Ufficio',
  SHOP = 'Negozio',
  GARAGE = 'Garage',
}

export enum CustomFieldType {
    TEXT = 'Testo',
    BOOLEAN = 'Si/No',
}

export interface CustomField {
    id: string;
    label: string;
    type: CustomFieldType;
    value: string | boolean;
}

export interface Property {
  id: string;
  projectId: string;
  code: string;
  name: string;
  address: string;
  type: PropertyType;
  surface: number; // in square meters
  rooms: number;
  isRented: boolean;
  rentAmount?: number;
  imageUrl: string;
  customFields: CustomField[];
  history: HistoryLog[];
}

export interface Tenant {
  id: string;
  projectId: string;
  name: string;
  email: string;
  phone: string;
  contractId: string;
  history: HistoryLog[];
}

export interface Contract {
  id: string;
  projectId: string;
  propertyId: string;
  tenantId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  rentAmount: number;
  documentUrl: string;
  history: HistoryLog[];
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
  projectId: string;
  propertyId: string;
  title: string;
  dueDate: string; // ISO date string
  isCompleted: boolean;
  type: DeadlineType;
  documentId?: string;
  history: HistoryLog[];
}

export enum MaintenanceStatus {
  REQUESTED = 'Richiesta',
  IN_PROGRESS = 'In Corso',
  COMPLETED = 'Completata',
}

export interface Maintenance {
  id: string;
  projectId: string;
  propertyId: string;
  description: string;
  status: MaintenanceStatus;
  requestDate: string; // ISO date string
  completionDate?: string; // ISO date string
  cost: number | null;
  history: HistoryLog[];
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
  projectId: string;
  propertyId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string
  providerUrl?: string;
  invoiceUrl?: string;
  history: HistoryLog[];
}

export interface Document {
    id: string;
    projectId: string;
    name: string;
    propertyId: string;
    type: string;
    uploadDate: string; // ISO date string
    fileUrl: string;
    expiryDate?: string;
    history: HistoryLog[];
}

export enum PaymentStatus {
  PAID = 'Pagato',
  PENDING = 'In Attesa',
  LATE = 'In Ritardo',
}

export interface Payment {
  id: string;
  projectId: string;
  contractId: string;
  propertyId: string;
  amount: number;
  paymentDate: string | null; // ISO date string
  dueDate: string; // ISO date string
  referenceMonth: number;
  referenceYear: number;
  status: PaymentStatus;
  history: HistoryLog[];
}