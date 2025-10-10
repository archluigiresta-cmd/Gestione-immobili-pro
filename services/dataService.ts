
import { MOCK_USERS, MOCK_PROPERTIES, MOCK_TENANTS, MOCK_CONTRACTS, MOCK_DEADLINES, MOCK_MAINTENANCES, MOCK_EXPENSES, MOCK_DOCUMENTS } from '../constants';
import { User, Property, Tenant, Contract, Deadline, Maintenance, Expense, Document } from '../types';

const initData = <T,>(key: string, mockData: T[]): T[] => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
    }
    localStorage.setItem(key, JSON.stringify(mockData));
    return mockData;
};

const saveData = <T,>(key: string, data: T[]): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};

const generateId = (): string => `id-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;

// Users
export const getUsers = (): User[] => initData('users', MOCK_USERS);
export const getUser = (id: string): User | undefined => getUsers().find(u => u.id === id);
export const updateUser = (updatedUser: User): void => {
    let users = getUsers();
    users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
    saveData('users', users);
};

// Properties
export const getProperties = (): Property[] => initData('properties', MOCK_PROPERTIES);
export const getProperty = (id: string): Property | undefined => getProperties().find(p => p.id === id);
export const addProperty = (propertyData: Omit<Property, 'id'>): void => {
    const properties = getProperties();
    const newProperty: Property = { ...propertyData, id: generateId() };
    saveData('properties', [...properties, newProperty]);
};
export const updateProperty = (updatedProperty: Property): void => {
    let properties = getProperties();
    properties = properties.map(p => p.id === updatedProperty.id ? updatedProperty : p);
    saveData('properties', properties);
};
export const deleteProperty = (id: string): void => {
    let properties = getProperties();
    properties = properties.filter(p => p.id !== id);
    saveData('properties', properties);
};

// Tenants
export const getTenants = (): Tenant[] => initData('tenants', MOCK_TENANTS);
export const addTenant = (tenantData: Omit<Tenant, 'id'>): void => {
    const tenants = getTenants();
    const newTenant: Tenant = { ...tenantData, id: generateId() };
    saveData('tenants', [...tenants, newTenant]);
};
export const updateTenant = (updatedTenant: Tenant): void => {
    let tenants = getTenants();
    tenants = tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t);
    saveData('tenants', tenants);
};
export const deleteTenant = (id: string): void => {
    let tenants = getTenants();
    tenants = tenants.filter(t => t.id !== id);
    saveData('tenants', tenants);
};

// Contracts
export const getContracts = (): Contract[] => initData('contracts', MOCK_CONTRACTS);
export const addContract = (contractData: Omit<Contract, 'id'|'documentUrl'>): void => {
    const contracts = getContracts();
    const newContract: Contract = { ...contractData, id: generateId(), documentUrl: '#' };
    saveData('contracts', [...contracts, newContract]);
    // Also update property status
    const properties = getProperties();
    const property = properties.find(p => p.id === contractData.propertyId);
    if(property) {
        property.isRented = true;
        updateProperty(property);
    }
};
export const updateContract = (updatedContract: Contract): void => {
    let contracts = getContracts();
    contracts = contracts.map(c => c.id === updatedContract.id ? updatedContract : c);
    saveData('contracts', contracts);
};
export const deleteContract = (id: string): void => {
    const contracts = getContracts();
    const contractToDelete = contracts.find(c => c.id === id);
    if (contractToDelete) {
        const properties = getProperties();
        const property = properties.find(p => p.id === contractToDelete.propertyId);
        if (property) {
            property.isRented = false;
            updateProperty(property);
        }
    }
    saveData('contracts', contracts.filter(c => c.id !== id));
};

// Deadlines
export const getDeadlines = (): Deadline[] => initData('deadlines', MOCK_DEADLINES);
export const addDeadline = (deadlineData: Omit<Deadline, 'id' | 'isCompleted'>): void => {
    const deadlines = getDeadlines();
    const newDeadline: Deadline = { ...deadlineData, id: generateId(), isCompleted: false };
    saveData('deadlines', [...deadlines, newDeadline]);
};
export const updateDeadline = (updatedDeadline: Deadline): void => {
    let deadlines = getDeadlines();
    deadlines = deadlines.map(d => d.id === updatedDeadline.id ? updatedDeadline : d);
    saveData('deadlines', deadlines);
};
export const deleteDeadline = (id: string): void => {
    let deadlines = getDeadlines();
    deadlines = deadlines.filter(d => d.id !== id);
    saveData('deadlines', deadlines);
};
export const toggleDeadlineStatus = (id: string): void => {
    let deadlines = getDeadlines();
    const deadline = deadlines.find(d => d.id === id);
    if (deadline) {
        deadline.isCompleted = !deadline.isCompleted;
        saveData('deadlines', deadlines);
    }
};

// Maintenance
export const getMaintenances = (): Maintenance[] => initData('maintenances', MOCK_MAINTENANCES);
export const addMaintenance = (maintenanceData: Omit<Maintenance, 'id'>): void => {
    const maintenances = getMaintenances();
    const newMaintenance: Maintenance = { ...maintenanceData, id: generateId() };
    saveData('maintenances', [...maintenances, newMaintenance]);
};
export const updateMaintenance = (updatedMaintenance: Maintenance): void => {
    let maintenances = getMaintenances();
    maintenances = maintenances.map(m => m.id === updatedMaintenance.id ? updatedMaintenance : m);
    saveData('maintenances', maintenances);
};
export const deleteMaintenance = (id: string): void => {
    let maintenances = getMaintenances();
    maintenances = maintenances.filter(m => m.id !== id);
    saveData('maintenances', maintenances);
};

// Expenses
export const getExpenses = (): Expense[] => initData('expenses', MOCK_EXPENSES);
export const addExpense = (expenseData: Omit<Expense, 'id'>): void => {
    const expenses = getExpenses();
    const newExpense: Expense = { ...expenseData, id: generateId() };
    saveData('expenses', [...expenses, newExpense]);
};
export const updateExpense = (updatedExpense: Expense): void => {
    let expenses = getExpenses();
    expenses = expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e);
    saveData('expenses', expenses);
};
export const deleteExpense = (id: string): void => {
    let expenses = getExpenses();
    expenses = expenses.filter(e => e.id !== id);
    saveData('expenses', expenses);
};

// Documents
export const getDocuments = (): Document[] => initData('documents', MOCK_DOCUMENTS);
export const addDocument = (docData: Omit<Document, 'id'>): void => {
    const documents = getDocuments();
    const newDoc: Document = { ...docData, id: generateId() };
    saveData('documents', [...documents, newDoc]);
};
export const updateDocument = (updatedDoc: Document): void => {
    let documents = getDocuments();
    documents = documents.map(d => d.id === updatedDoc.id ? updatedDoc : d);
    saveData('documents', documents);
};
export const deleteDocument = (id: string): void => {
    let documents = getDocuments();
    documents = documents.filter(d => d.id !== id);
    saveData('documents', documents);
};
