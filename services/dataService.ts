
import { Property, User } from '../types';
import { MOCK_PROPERTIES, MOCK_USERS } from '../constants';

const initData = <T,>(storageKey: string, mockData: T[]): void => {
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(mockData));
    }
};

// Initialize all data sets on first load
initData('properties', MOCK_PROPERTIES);
initData('users', MOCK_USERS);
// ... future inits for tenants, payments, etc.

const getData = <T,>(storageKey: string): T[] => {
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
};

const saveData = <T,>(storageKey: string, data: T[]): void => {
    localStorage.setItem(storageKey, JSON.stringify(data));
};

// --- Properties ---
export const getProperties = (): Property[] => {
    return getData<Property>('properties');
};

export const addProperty = (propertyData: Omit<Property, 'id' | 'imageUrl' | 'isRented' | 'rentAmount'>): Property => {
    const properties = getProperties();
    const newProperty: Property = {
        ...propertyData,
        id: `p${new Date().getTime()}`, // Simple unique ID
        imageUrl: `https://picsum.photos/seed/p${new Date().getTime()}/600/400`,
        isRented: false,
        rentAmount: null,
    };
    const updatedProperties = [...properties, newProperty];
    saveData('properties', updatedProperties);
    return newProperty;
};

// --- Users ---
export const getUsers = (): User[] => {
    return getData<User>('users');
};

export const saveUsers = (users: User[]): void => {
    saveData('users', users);
}

export const updateUser = (updatedUser: User): User => {
    let users = getUsers();
    users = users.map(user => user.id === updatedUser.id ? updatedUser : user);
    saveUsers(users);
    return updatedUser;
};
