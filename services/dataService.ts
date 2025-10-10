import { Property, User, Tenant, Contract, Expense } from '../types';
import { MOCK_PROPERTIES, MOCK_USERS, MOCK_TENANTS, MOCK_CONTRACTS, MOCK_EXPENSES } from '../constants';

const initData = <T,>(storageKey: string, mockData: T[]): void => {
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(mockData));
    }
};

// Initialize all data sets on first load
initData('properties', MOCK_PROPERTIES);
initData('users', MOCK_USERS);
initData('tenants', MOCK_TENANTS);
initData('contracts', MOCK_CONTRACTS);
initData('expenses', MOCK_EXPENSES);
// ... future inits for payments, etc.

const getData = <T,>(storageKey: string): T[] => {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
};

const saveData = <T,>(storageKey: string, data: T[]): void => {
    localStorage.setItem(storageKey, JSON.stringify(data));
};

// --- Properties ---
export const getProperties = (): Property[] => getData<Property>('properties');
export const addProperty = (propertyData: Omit<Property, 'id' | 'imageUrl' | 'isRented' | 'rentAmount'>): Property => {
    const properties = getProperties();
    const newProperty: Property = {
        ...propertyData,
        id: `p${new Date().getTime()}`,
        imageUrl: `https://picsum.photos/seed/p${new Date().getTime()}/600/400`,
        isRented: false,
        rentAmount: null,
    };
    const updatedProperties = [...properties, newProperty];
    saveData('properties', updatedProperties);
    return newProperty;
};
export const updateProperty = (updatedProperty: Property): Property => {
    let properties = getProperties();
    properties = properties.map(p => p.id === updatedProperty.id ? updatedProperty : p);
    saveData('properties', properties);
    return updatedProperty;
};
export const deleteProperty = (propertyId: string): void => {
    let properties = getProperties();
    properties = properties.filter(p => p.id !== propertyId);
    saveData('properties', properties);
};


// --- Users ---
export const getUsers = (): User[] => getData<User>('users');
export const saveUsers = (users: User[]): void => saveData('users', users);
export const updateUser = (updatedUser: User): User => {
    let users = getUsers();
    users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
    saveUsers(users);
    return updatedUser;
};

// --- Tenants ---
export const getTenants = (): Tenant[] => getData<Tenant>('tenants');
export const addTenant = (tenantData: Omit<Tenant, 'id'>): Tenant => {
    const tenants = getTenants();
    const newTenant: Tenant = { ...tenantData, id: `t${new Date().getTime()}` };
    const updatedTenants = [...tenants, newTenant];
    saveData('tenants', updatedTenants);
    return newTenant;
};
export const updateTenant = (updatedTenant: Tenant): Tenant => {
    let tenants = getTenants();
    tenants = tenants.map(t => t.id === updatedTenant.id ? updatedTenant : t);
    saveData('tenants', tenants);
    return updatedTenant;
};
export const deleteTenant = (tenantId: string): void => {
    let tenants = getTenants();
    tenants = tenants.filter(t => t.id !== tenantId);
    saveData('tenants', tenants);
};

// --- Contracts ---
export const getContracts = (): Contract[] => getData<Contract>('contracts');
export const addContract = (contractData: Omit<Contract, 'id' | 'documentUrl'>): Contract => {
    const contracts = getContracts();
    const newContract: Contract = { ...contractData, id: `c${new Date().getTime()}`, documentUrl: '#' };
    const updatedContracts = [...contracts, newContract];
    saveData('contracts', updatedContracts);

    // Update property status
    const properties = getProperties();
    const updatedProperties = properties.map(p => p.id === newContract.propertyId ? { ...p, isRented: true, rentAmount: newContract.rentAmount } : p);
    saveData('properties', updatedProperties);

    return newContract;
};
export const updateContract = (updatedContract: Contract): Contract => {
    let contracts = getContracts();
    contracts = contracts.map(c => c.id === updatedContract.id ? updatedContract : c);
    saveData('contracts', contracts);
    return updatedContract;
};
export const deleteContract = (contractId: string): void => {
    const contracts = getContracts();
    const contractToDelete = contracts.find(c => c.id === contractId);
    
    let updatedContracts = contracts.filter(c => c.id !== contractId);
    saveData('contracts', updatedContracts);

    // Update property status if it was associated with the deleted contract
    if (contractToDelete) {
        const properties = getProperties();
        const updatedProperties = properties.map(p => p.id === contractToDelete.propertyId ? { ...p, isRented: false, rentAmount: null } : p);
        saveData('properties', updatedProperties);
    }
};

// --- Expenses ---
export const getExpenses = (): Expense[] => getData<Expense>('expenses');
export const addExpense = (expenseData: Omit<Expense, 'id'>): Expense => {
    const expenses = getExpenses();
    const newExpense: Expense = { ...expenseData, id: `e${new Date().getTime()}` };
    const updatedExpenses = [...expenses, newExpense];
    saveData('expenses', updatedExpenses);
    return newExpense;
};
export const updateExpense = (updatedExpense: Expense): Expense => {
    let expenses = getExpenses();
    expenses = expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e);
    saveData('expenses', expenses);
    return updatedExpense;
};
export const deleteExpense = (expenseId: string): void => {
    let expenses = getExpenses();
    expenses = expenses.filter(e => e.id !== expenseId);
    saveData('expenses', expenses);
};