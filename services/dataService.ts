import { MOCK_USERS, MOCK_PROPERTIES, MOCK_TENANTS, MOCK_CONTRACTS, MOCK_DEADLINES, MOCK_MAINTENANCES, MOCK_EXPENSES, MOCK_DOCUMENTS, MOCK_PROJECTS, MOCK_PAYMENTS } from '../constants';
import { User, Property, Tenant, Contract, Deadline, Maintenance, Expense, Document, DeadlineType, Project, HistoryLog, Payment, UserStatus } from '../types';

const CURRENT_DATA_VERSION = 2;

export const migrateData = () => {
    const storedVersionStr = localStorage.getItem('dataVersion');
    let storedVersion = storedVersionStr ? parseInt(storedVersionStr, 10) : 1;

    if (storedVersion >= CURRENT_DATA_VERSION) {
        return; // No migration needed
    }

    console.log(`Migrating data from version ${storedVersion} to ${CURRENT_DATA_VERSION}`);

    switch (storedVersion) {
        case 1:
            // Migration from v1 to v2: Add creationDate to all properties
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
                // In a real app, you might want to handle this more gracefully,
                // e.g., by notifying the user or attempting a backup.
            }
            // falls through to the next case if there are more migrations
        
        // case 2:
            // Future migration from v2 to v3 would go here.
            // ...
            // break;
    }

    localStorage.setItem('dataVersion', String(CURRENT_DATA_VERSION));
    console.log('Data migration complete.');
};


const initData = <T,>(key: string, mockData: T[]): T[] => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            let parsedData = JSON.parse(storedData);

            // Special check for projects to ensure the demo project exists for the demo user
            if (key === 'projects') {
                const demoProjectExists = parsedData.some((p: Project) => p.id === 'proj-1');
                const demoProject = MOCK_PROJECTS.find(p => p.id === 'proj-1');
                if (!demoProjectExists && demoProject) {
                    parsedData.push(demoProject);
                    saveData(key, parsedData); // Save the corrected list back to localStorage
                }
            }
            return parsedData;
        }
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
    }
    localStorage.setItem(key, JSON.stringify(mockData));
    localStorage.setItem('dataVersion', String(CURRENT_DATA_VERSION)); // Set version for new users
    return mockData;
};

const saveData = <T,>(key: string, data: T[]): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
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
    const newUser: User = { ...userData, id: generateId('user'), status: UserStatus.PENDING };
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
    let projects = getProjects();
    projects = projects.filter(p => p.id !== id);
    saveData('projects', projects);
    // Note: In a real app, you'd also delete all associated data (properties, etc.)
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
    const newHistory = [...(updatedProperty.history || []), newLogEntry];
    properties = properties.map(p => p.id === updatedProperty.id ? { ...updatedProperty, history: newHistory } : p);
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
    const newHistory = [...(updatedTenant.history || []), newLogEntry];
    tenants = tenants.map(t => t.id === updatedTenant.id ? { ...updatedTenant, history: newHistory } : t);
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
    const newHistory = [...(updatedContract.history || []), newLogEntry];
    contracts = contracts.map(c => c.id === updatedContract.id ? { ...updatedContract, history: newHistory } : c);
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
    const newHistory = [...(updatedDeadline.history || []), newLogEntry];
    deadlines = deadlines.map(d => d.id === updatedDeadline.id ? { ...updatedDeadline, history: newHistory } : d);
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
    const newHistory = [...(updatedMaintenance.history || []), newLogEntry];
    maintenances = maintenances.map(m => m.id === updatedMaintenance.id ? { ...updatedMaintenance, history: newHistory } : m);
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
    const newHistory = [...(updatedExpense.history || []), newLogEntry];
    expenses = expenses.map(e => e.id === updatedExpense.id ? { ...updatedExpense, history: newHistory } : e);
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
    const newHistory = [...(updatedDoc.history || []), newLogEntry];
    documents = documents.map(d => (d.id === updatedDoc.id ? { ...updatedDoc, history: newHistory } : d));
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
    const newHistory = [...(updatedPayment.history || []), newLogEntry];
    payments = payments.map(p => p.id === updatedPayment.id ? { ...updatedPayment, history: newHistory } : p);
    saveData('payments', payments);
};

export const deletePayment = (id: string): void => {
    let payments = getAllPayments();
    payments = payments.filter(p => p.id !== id);
    saveData('payments', payments);
};