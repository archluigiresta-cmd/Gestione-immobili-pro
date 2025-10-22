

import { MOCK_USERS, MOCK_PROPERTIES, MOCK_TENANTS, MOCK_CONTRACTS, MOCK_DEADLINES, MOCK_MAINTENANCES, MOCK_EXPENSES, MOCK_DOCUMENTS, MOCK_PROJECTS, MOCK_PAYMENTS } from '../constants';
import { User, Property, Tenant, Contract, Deadline, Maintenance, Expense, Document, DeadlineType, Project, HistoryLog, Payment, UserStatus, AppData } from '../types';
import { saveDataToDrive } from './googleDriveService';

const CURRENT_DATA_VERSION = 2;

const DATA_KEYS: (keyof AppData)[] = ['users', 'projects', 'properties', 'tenants', 'contracts', 'deadlines', 'maintenances', 'expenses', 'documents', 'payments', 'dataVersion'];

let driveFileId: string | null = null;
let debounceTimer: number | null = null;

export const setDriveFileId = (id: string | null) => {
    driveFileId = id;
};

const _getAllDataAsObject = (): AppData => {
    const appData: Partial<AppData> = {};
    DATA_KEYS.forEach(key => {
        const data = localStorage.getItem(key as string);
        if (data) {
            try {
                (appData as any)[key] = JSON.parse(data);
            } catch (e) {
                console.error(`Failed to parse data for key ${String(key)}`, e);
            }
        }
    });
    return appData as AppData;
};

const debouncedSaveToDrive = () => {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = window.setTimeout(() => {
        if (driveFileId) {
            console.log('Debounced save executing...');
            const allData = _getAllDataAsObject();
            saveDataToDrive(driveFileId, allData)
              .then(() => console.log('Successfully saved to Google Drive.'))
              .catch(err => console.error('Failed to save to Google Drive:', err));
        }
    }, 2000); // 2-second delay
};

export const migrateData = () => {
    const storedVersionStr = localStorage.getItem('dataVersion');
    let storedVersion = storedVersionStr ? parseInt(storedVersionStr, 10) : 1;

    if (storedVersion >= CURRENT_DATA_VERSION) {
        return;
    }

    console.log(`Migrating data from version ${storedVersion} to ${CURRENT_DATA_VERSION}`);

    switch (storedVersion) {
        case 1:
            try {
                const properties = getAllProperties();
                const migratedProperties = properties.map(p => {
                    if (!p.creationDate) {
                        return { ...p, creationDate: new Date().toISOString() };
                    }
                    return p;
                });
                saveData('properties', migratedProperties);
                console.log('Successfully migrated properties to v2.');
            } catch (error) {
                console.error('Error during v1 to v2 migration:', error);
            }
    }

    localStorage.setItem('dataVersion', String(CURRENT_DATA_VERSION));
    console.log('Data migration complete.');
};


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
    if (key === 'users') { // Set version only once
        localStorage.setItem('dataVersion', String(CURRENT_DATA_VERSION));
    }
    return mockData;
};

const saveData = <T,>(key: string, data: T[]): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        if (driveFileId) {
            debouncedSaveToDrive();
        }
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};

export const loadDataFromObject = (data: AppData) => {
    DATA_KEYS.forEach(key => {
        if (data[key]) {
            localStorage.setItem(key as string, JSON.stringify(data[key]));
        }
    });
    console.log("Data loaded into localStorage from Drive.");
};


const generateId = (prefix: string): string => `${prefix}-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;

const createLogEntry = (userId: string, description: string): HistoryLog => ({
  id: generateId('log'),
  timestamp: new Date().toISOString(),
  userId,
  description,
});

// Users
export const getUsers = (): User[] => initData('users', MOCK_USERS);
export const getUser = (id: string): User | undefined => getUsers().find(u => u.id === id);
export const addUser = (userData: Omit<User, 'id' | 'status'>): User => {
    const users = getUsers();
    const newUser: User = { 
        ...userData, 
        id: generateId('user'), 
        status: UserStatus.PENDING,
        ...(userData.password && { password: userData.password })
    };
    saveData('users', [...users, newUser]);
    return newUser;
};
export const updateUser = (updatedUser: User): void => {
    let users = getUsers();
    users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
    saveData('users', users);
};
export const approveUser = (userId: string): void => {
    let users = getUsers();
    users = users.map(user => user.id === userId ? { ...user, status: UserStatus.ACTIVE } : user);
    saveData('users', users);
};
export const deleteUser = (id: string): void => {
    let users = getUsers();
    if (users.length <= 1 && users.every(u => u.status === UserStatus.ACTIVE)) {
        console.warn("Cannot delete the last active user.");
        return;
    }
    users = users.filter(u => u.id !== id);
    saveData('users', users);
};

// Projects
export const getProjects = (): Project[] => initData('projects', MOCK_PROJECTS);
export const getProjectsForUser = (userId: string): Project[] => {
    const allProjects = getProjects();
    return allProjects.filter(p => p.members.some(m => m.userId === userId));
};
export const addProject = (projectData: Omit<Project, 'id'>): Project => {
    const projects = getProjects();
    const newProject: Project = { ...projectData, id: generateId('proj') };
    saveData('projects', [...projects, newProject]);
    return newProject;
};
export const updateProject = (updatedProject: Project): void => {
    let projects = getProjects();
    projects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    saveData('projects', projects);
};
export const deleteProject = (id: string): void => {
    // Cascade delete: remove all data associated with the project
    saveData('properties', getAllProperties().filter(p => p.projectId !== id));
    saveData('tenants', getAllTenants().filter(t => t.projectId !== id));
    saveData('contracts', getAllContracts().filter(c => c.projectId !== id));
    saveData('deadlines', getAllDeadlines().filter(d => d.projectId !== id));
    saveData('maintenances', getAllMaintenances().filter(m => m.projectId !== id));
    saveData('expenses', getAllExpenses().filter(e => e.projectId !== id));
    saveData('documents', getAllDocuments().filter(d => d.projectId !== id));
    saveData('payments', getAllPayments().filter(p => p.projectId !== id));
    
    // Finally, delete the project itself
    let projects = getProjects();
    projects = projects.filter(p => p.id !== id);
    saveData('projects', projects);
};


// Project-scoped data functions
const getAllProperties = (): Property[] => initData('properties', MOCK_PROPERTIES);
export const getProperties = (projectId: string): Property[] => getAllProperties().filter(p => p.projectId === projectId);
export const getProperty = (projectId: string, id: string): Property | undefined => getProperties(projectId).find(p => p.id === id);
export const addProperty = (propertyData: Omit<Property, 'id' | 'customFields' | 'history' | 'creationDate'>, userId: string): Property => {
    const properties = getAllProperties();
    const newProperty: Property = { 
        ...propertyData, 
        id: generateId('prop'), 
        customFields: [], 
        history: [createLogEntry(userId, 'Immobile creato.')],
        creationDate: new Date().toISOString()
    };
    saveData('properties', [...properties, newProperty]);
    return newProperty;
};
export const updateProperty = (updatedProperty: Property, userId: string): void => {
    let properties = getAllProperties();
    const originalProperty = properties.find(p => p.id === updatedProperty.id);

    let changeDescription = 'Dettagli immobile aggiornati.';
    if (originalProperty) {
        const changes: string[] = [];
        if (originalProperty.name !== updatedProperty.name) changes.push(`nome modificato`);
        if (originalProperty.address !== updatedProperty.address) changes.push(`indirizzo modificato`);
        if (originalProperty.surface !== updatedProperty.surface) changes.push(`superficie modificata`);
        if (originalProperty.isRented !== updatedProperty.isRented) changes.push(`stato di affitto modificato`);
        if (originalProperty.customFields.length !== updatedProperty.customFields.length) changes.push('campi personalizzati aggiornati');
        
        if (changes.length > 0) {
            changeDescription = `Modifiche: ${changes.join(', ')}.`;
        }
    }

    const newLogEntry = createLogEntry(userId, changeDescription);
    const propertyToSave: Property = {
        ...updatedProperty,
        history: [...(updatedProperty.history || []), newLogEntry],
        customFields: updatedProperty.customFields || []
    };
    
    properties = properties.map(p => p.id === updatedProperty.id ? propertyToSave : p);
    saveData('properties', properties);
};
export const deleteProperty = (id: string): void => {
    let properties = getAllProperties();
    properties = properties.filter(p => p.id !== id);
    saveData('properties', properties);
};

const getAllTenants = (): Tenant[] => initData('tenants', MOCK_TENANTS);
export const getTenants = (projectId: string): Tenant[] => getAllTenants().filter(t => t.projectId === projectId);
export const addTenant = (tenantData: Omit<Tenant, 'id' | 'history'>, userId: string): void => {
    const tenants = getAllTenants();
    const newTenant: Tenant = { ...tenantData, id: generateId('tenant'), customFields: tenantData.customFields || [], history: [createLogEntry(userId, 'Inquilino aggiunto.')] };
    saveData('tenants', [...tenants, newTenant]);
};
export const updateTenant = (updatedTenant: Tenant, userId: string): void => {
    let tenants = getAllTenants();
    const newLogEntry = createLogEntry(userId, 'Dati inquilino aggiornati.');
    const tenantToSave: Tenant = {
        ...updatedTenant,
        history: [...(updatedTenant.history || []), newLogEntry],
        customFields: updatedTenant.customFields || []
    };
    tenants = tenants.map(t => t.id === updatedTenant.id ? tenantToSave : t);
    saveData('tenants', tenants);
};
export const deleteTenant = (id: string): void => {
    let tenants = getAllTenants();
    tenants = tenants.filter(t => t.id !== id);
    saveData('tenants', tenants);
};

const getAllContracts = (): Contract[] => initData('contracts', MOCK_CONTRACTS);
export const getContracts = (projectId: string): Contract[] => getAllContracts().filter(c => c.projectId === projectId);
export const addContract = (contractData: Omit<Contract, 'id'|'documentUrl' | 'history'>, userId: string): void => {
    const contracts = getAllContracts();
    const newContract: Contract = { ...contractData, id: generateId('contract'), documentUrl: '#', customFields: contractData.customFields || [], history: [createLogEntry(userId, 'Contratto creato.')] };
    saveData('contracts', [...contracts, newContract]);
    const property = getAllProperties().find(p => p.id === contractData.propertyId);
    if(property) {
        property.isRented = true;
        updateProperty(property, userId);
    }
};
export const updateContract = (updatedContract: Contract, userId: string): void => {
    let contracts = getAllContracts();
    const newLogEntry = createLogEntry(userId, 'Dettagli contratto aggiornati.');
    const contractToSave: Contract = {
        ...updatedContract,
        history: [...(updatedContract.history || []), newLogEntry],
        customFields: updatedContract.customFields || []
    };
    contracts = contracts.map(c => c.id === updatedContract.id ? contractToSave : c);
    saveData('contracts', contracts);
};
export const deleteContract = (id: string, userId: string): void => {
    const contracts = getAllContracts();
    const contractToDelete = contracts.find(c => c.id === id);
    if (contractToDelete) {
        const property = getAllProperties().find(p => p.id === contractToDelete.propertyId);
        if (property) {
            property.isRented = false;
            updateProperty(property, userId);
        }
    }
    saveData('contracts', contracts.filter(c => c.id !== id));
};

const getAllDeadlines = (): Deadline[] => initData('deadlines', MOCK_DEADLINES);
export const getDeadlines = (projectId: string): Deadline[] => getAllDeadlines().filter(d => d.projectId === projectId);
export const addDeadline = (deadlineData: Omit<Deadline, 'id' | 'isCompleted' | 'history'>, userId: string): Deadline => {
    const deadlines = getAllDeadlines();
    const newDeadline: Deadline = { ...deadlineData, id: generateId('deadline'), isCompleted: false, history: [createLogEntry(userId, 'Scadenza creata.')] };
    saveData('deadlines', [...deadlines, newDeadline]);
    return newDeadline;
};
export const updateDeadline = (updatedDeadline: Deadline, userId: string): void => {
    let deadlines = getAllDeadlines();
    const newLogEntry = createLogEntry(userId, `Scadenza "${updatedDeadline.title}" aggiornata.`);
    const deadlineToSave: Deadline = {
        ...updatedDeadline,
        history: [...(updatedDeadline.history || []), newLogEntry],
    };
    deadlines = deadlines.map(d => d.id === updatedDeadline.id ? deadlineToSave : d);
    saveData('deadlines', deadlines);
};
export const deleteDeadline = (id: string): void => {
    let deadlines = getAllDeadlines();
    deadlines = deadlines.filter(d => d.id !== id);
    saveData('deadlines', deadlines);
};
export const toggleDeadlineStatus = (id: string, userId: string): void => {
    let deadlines = getAllDeadlines();
    const deadline = deadlines.find(d => d.id === id);
    if (deadline) {
        deadline.isCompleted = !deadline.isCompleted;
        const description = `Stato modificato in "${deadline.isCompleted ? 'Completata' : 'Da completare'}".`;
        const newLogEntry = createLogEntry(userId, description);
        deadline.history = [...(deadline.history || []), newLogEntry];
        saveData('deadlines', deadlines);
    }
};

const getAllMaintenances = (): Maintenance[] => initData('maintenances', MOCK_MAINTENANCES);
export const getMaintenances = (projectId: string): Maintenance[] => getAllMaintenances().filter(m => m.projectId === projectId);
export const addMaintenance = (maintenanceData: Omit<Maintenance, 'id' | 'history'>, userId: string): void => {
    const maintenances = getAllMaintenances();
    const newMaintenance: Maintenance = { ...maintenanceData, id: generateId('maint'), history: [createLogEntry(userId, 'Richiesta di manutenzione creata.')] };
    saveData('maintenances', [...maintenances, newMaintenance]);
};
export const updateMaintenance = (updatedMaintenance: Maintenance, userId: string): void => {
    let maintenances = getAllMaintenances();
    const description = `Stato manutenzione aggiornato a "${updatedMaintenance.status}".`;
    const newLogEntry = createLogEntry(userId, description);
    const maintenanceToSave: Maintenance = {
        ...updatedMaintenance,
        history: [...(updatedMaintenance.history || []), newLogEntry],
    };
    maintenances = maintenances.map(m => m.id === updatedMaintenance.id ? maintenanceToSave : m);
    saveData('maintenances', maintenances);
};
export const deleteMaintenance = (id: string): void => {
    let maintenances = getAllMaintenances();
    maintenances = maintenances.filter(m => m.id !== id);
    saveData('maintenances', maintenances);
};

const getAllExpenses = (): Expense[] => initData('expenses', MOCK_EXPENSES);
export const getExpenses = (projectId: string): Expense[] => getAllExpenses().filter(e => e.projectId === projectId);
export const addExpense = (expenseData: Omit<Expense, 'id' | 'history'>, userId: string): void => {
    const expenses = getAllExpenses();
    const newExpense: Expense = { ...expenseData, id: generateId('exp'), history: [createLogEntry(userId, 'Spesa aggiunta.')] };
    saveData('expenses', [...expenses, newExpense]);
};
export const updateExpense = (updatedExpense: Expense, userId: string): void => {
    let expenses = getAllExpenses();
    const newLogEntry = createLogEntry(userId, `Spesa "${updatedExpense.description}" aggiornata.`);
    const expenseToSave: Expense = {
        ...updatedExpense,
        history: [...(updatedExpense.history || []), newLogEntry],
    };
    expenses = expenses.map(e => e.id === updatedExpense.id ? expenseToSave : e);
    saveData('expenses', expenses);
};
export const deleteExpense = (id: string): void => {
    let expenses = getAllExpenses();
    expenses = expenses.filter(e => e.id !== id);
    saveData('expenses', expenses);
};

const getAllDocuments = (): Document[] => initData('documents', MOCK_DOCUMENTS);
export const getDocuments = (projectId: string): Document[] => getAllDocuments().filter(d => d.projectId === projectId);
const syncDeadlineForDocument = (doc: Document, userId: string, existingDeadline?: Deadline | null) => {
    const deadlineForDoc = existingDeadline !== undefined ? existingDeadline : getAllDeadlines().find(d => d.documentId === doc.id);

    if (doc.expiryDate) {
        const deadlineData = {
            projectId: doc.projectId,
            propertyId: doc.propertyId,
            title: `Scadenza documento: ${doc.name}`,
            dueDate: doc.expiryDate,
            type: DeadlineType.DOCUMENT,
            documentId: doc.id,
        };

        if (deadlineForDoc) {
            updateDeadline({ ...deadlineForDoc, ...deadlineData }, userId);
        } else {
            addDeadline(deadlineData, userId);
        }
    } 
    else if (deadlineForDoc) {
        deleteDeadline(deadlineForDoc.id);
    }
};
export const addDocument = (docData: Omit<Document, 'id' | 'history'>, userId: string): void => {
    const documents = getAllDocuments();
    const newDoc: Document = { ...docData, id: generateId('doc'), customFields: docData.customFields || [], history: [createLogEntry(userId, 'Documento caricato.')] };
    saveData('documents', [...documents, newDoc]);
    syncDeadlineForDocument(newDoc, userId, null);
};
export const updateDocument = (updatedDoc: Document, userId: string): void => {
    let documents = getAllDocuments();
    const newLogEntry = createLogEntry(userId, `Documento "${updatedDoc.name}" aggiornato.`);
    const documentToSave: Document = {
        ...updatedDoc,
        history: [...(updatedDoc.history || []), newLogEntry],
        customFields: updatedDoc.customFields || []
    };
    documents = documents.map(d => (d.id === updatedDoc.id ? documentToSave : d));
    saveData('documents', documents);
    syncDeadlineForDocument(updatedDoc, userId);
};
export const deleteDocument = (id: string, userId: string): void => {
    let documents = getAllDocuments();
    const docToDelete = documents.find(d => d.id === id);
    if (docToDelete) {
        syncDeadlineForDocument({ ...docToDelete, expiryDate: undefined }, userId);
    }
    documents = documents.filter(d => d.id !== id);
    saveData('documents', documents);
};

// Payments
const getAllPayments = (): Payment[] => initData('payments', MOCK_PAYMENTS);
export const getPayments = (projectId: string): Payment[] => getAllPayments().filter(p => p.projectId === projectId);

export const addPayment = (paymentData: Omit<Payment, 'id' | 'history'>, userId: string): void => {
    const payments = getAllPayments();
    const newPayment: Payment = { ...paymentData, id: generateId('pay'), history: [createLogEntry(userId, 'Pagamento registrato.')] };
    saveData('payments', [...payments, newPayment]);
};

export const updatePayment = (updatedPayment: Payment, userId: string): void => {
    let payments = getAllPayments();
    const description = `Pagamento aggiornato. Stato: ${updatedPayment.status}, Importo: €${updatedPayment.amount}`;
    const newLogEntry = createLogEntry(userId, description);
    const paymentToSave: Payment = {
        ...updatedPayment,
        history: [...(updatedPayment.history || []), newLogEntry],
    };
    payments = payments.map(p => p.id === updatedPayment.id ? paymentToSave : p);
    saveData('payments', payments);
};

export const deletePayment = (id: string): void => {
    let payments = getAllPayments();
    payments = payments.filter(p => p.id !== id);
    saveData('payments', payments);
};
