import { Property } from '../types';
import { MOCK_PROPERTIES } from '../constants';

const initData = <T,>(storageKey: string, mockData: T[]): void => {
    if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify(mockData));
    }
};

// Initialize all data sets on first load
initData('properties', MOCK_PROPERTIES);
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

// ... other functions for tenants, payments etc. will be added here
