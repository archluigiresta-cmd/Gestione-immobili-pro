export interface HistoryLog {
  id: string;
  timestamp: string; // ISO date string
  userId: string;
  description: string;
}

export enum UserStatus {
  ACTIVE = 'Attivo',
  PENDING = 'In attesa di approvazione',
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
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
  OTHER = 'Altro',
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
  typeOther?: string;
  surface: number; // in square meters
  rooms: number;
  isRented: boolean;
  rentAmount?: number;
  imageUrl: string;
  customFields: CustomField[];
  history: HistoryLog[];
  creationDate: string; // ISO date string
}

export interface Tenant {
  id: string;
  projectId: string;
  name: string;
  email: string;
  phone: string;
  contractId: string;
  customFields: CustomField[];
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
  customFields: CustomField[];
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
  typeOther?: string;
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

export enum UtilityType {
    ELECTRICITY = 'Energia Elettrica',
    GAS = 'Gas',
    WATER = 'Servizio Idrico',
    INTERNET = 'Internet',
    OTHER = 'Altro',
}

export enum TaxType {
    IMU = 'IMU',
    TARI = 'TARI',
    IRPEF = 'IRPEF',
    OTHER = 'Altro',
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
  categoryOther?: string;
  date: string; // ISO date string
  providerUrl?: string;
  invoiceUrl?: string;
  invoiceData?: string; // For uploaded files (base64 data URL)
  invoiceName?: string; // Name of the uploaded invoice file
  history: HistoryLog[];
  // Utility fields
  utilityType?: UtilityType;
  utilityTypeOther?: string;
  utilityProvider?: string;
  utilityDetails?: string;
  // Tax fields
  taxType?: TaxType;
  taxTypeOther?: string;
  taxReferenceYear?: number;
  taxDetails?: string;
}

export enum DocumentType {
    CONTRACT = 'Contratto',
    FLOOR_PLAN = 'Planimetria',
    CERTIFICATION = 'Certificazione',
    INSURANCE = 'Assicurazione',
    OTHER = 'Altro',
}

export interface Document {
    id: string;
    projectId: string;
    name: string;
    propertyId: string;
    type: DocumentType;
    typeOther?: string;
    uploadDate: string; // ISO date string
    fileUrl?: string; // For external links
    fileData?: string; // For uploaded files (base64 data URL)
    fileName?: string; // Name of the uploaded file
    expiryDate?: string;
    customFields: CustomField[];
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

export interface AppData {
  users: User[];
  projects: Project[];
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  deadlines: Deadline[];
  maintenances: Maintenance[];
  expenses: Expense[];
  documents: Document[];
  payments: Payment[];
  dataVersion?: number;
}