import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Tenant, User, Property, Contract } from '../types';
import { Mail, Phone, Home, PlusCircle, MoreVertical, Edit, Trash2, ChevronDown } from 'lucide-react';
import AddTenantModal from '../components/modals/AddTenantModal';
import EditTenantModal from '../components/modals/EditTenantModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

const getPropertyColors = (index: number) => {
    const colors = [
        'border-indigo-500', 'border-purple-500', 'border-pink-500', 'border-yellow-500',
        'border-red-500', 'border-teal-500', 'border-blue-500', 'border-green-500'
    ];
    return colors[index % colors.length];
};

const TenantCard: React.FC<{ tenant: Tenant, propertyName: string, onEdit: () => void, onDelete: () => void }> = ({ tenant, propertyName, onEdit, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow relative">
            <div ref={menuRef} className="absolute top-2 right-2">
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreVertical size={20} className="text-dark" />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 border">
                        <button onClick={() => { onEdit(); setMenuOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Edit size={16} className="mr-2" /> Modifica
                        </button>
                        <button onClick={() => { onDelete(); setMenuOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash2 size={16} className="mr-2" /> Elimina
                        </button>
                    </div>
                )}
            </div>
            
            <h3 className="text-lg font-bold text-primary pr-8">{tenant.name}</h3>
            <p className="text-sm text-gray-600 flex items-center mt-2"><Home size={14} className="mr-2" /> {propertyName}</p>
            <div className="mt-4 space-y-2">
                <a href={`mailto:${tenant.email}`} className="flex items-center text-gray-700 hover:text-primary">
                    <Mail size={14} className="mr-2" />
                    <span>{tenant.email}</span>
                </a>
                <a href={`tel:${tenant.phone}`} className="flex items-center text-gray-700 hover:text-primary">
                    <Phone size={14} className="mr-2" />
                    <span>{tenant.phone}</span>
                </a>
            </div>
        </div>
    );
};

interface TenantsScreenProps {
  projectId: string;
  user: User;
}

const TenantsScreen: React.FC<TenantsScreenProps> = ({ projectId, user }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = () => {
        setTenants(dataService.getTenants(projectId));
        setContracts(dataService.getContracts(projectId));
        setProperties(dataService.getProperties(projectId));
    };

    const handleAddTenant = (tenantData: Omit<Tenant, 'id' | 'history'>) => {
        dataService.addTenant({ ...tenantData, projectId }, user.id);
        loadData();
        setAddModalOpen(false);
    };

    const handleUpdateTenant = (updatedTenant: Tenant) => {
        dataService.updateTenant(updatedTenant, user.id);
        loadData();
        setEditingTenant(null);
    };

    const handleDeleteTenant = () => {
        if (deletingTenant) {
            dataService.deleteTenant(deletingTenant.id);
            loadData();
            setDeletingTenant(null);
        }
    };

    const toggleSection = (propertyId: string) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(propertyId)) {
                newSet.delete(propertyId);
            } else {
                newSet.add(propertyId);
            }
            return newSet;
        });
    };

    const groupedTenants = useMemo(() => {
        const contractMap = new Map(contracts.map(c => [c.id, c]));
        const propertyMap = new Map(properties.map(p => [p.id, p]));

        const groups: Record<string, { property: Property | null; tenants: Tenant[] }> = {};

        for (const tenant of tenants) {
            const contract = contractMap.get(tenant.contractId);
            const property = contract ? propertyMap.get(contract.propertyId) : null;
            const propertyId = property ? property.id : 'unassigned';

            if (!groups[propertyId]) {
                groups[propertyId] = { property, tenants: [] };
            }
            groups[propertyId].tenants.push(tenant);
        }
        
        return Object.values(groups).sort((a, b) => {
            if (!a.property) return 1;
            if (!b.property) return -1;
            return a.property.name.localeCompare(b.property.name);
        });
    }, [tenants, contracts, properties]);


    return (
        <>
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-dark">Elenco Inquilini</h1>
                <button
                    onClick={() => setAddModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                >
                    <PlusCircle size={18} className="mr-2" />
                    Aggiungi Inquilino
                </button>
            </div>
             <div className="space-y-4">
                {groupedTenants.map((group, index) => {
                    const propertyId = group.property ? group.property.id : 'unassigned';
                    const propertyName = group.property ? group.property.name : 'Inquilini non assegnati';
                    const isOpen = openSections.has(propertyId);
                    
                    return (
                        <div key={propertyId} className={`rounded-lg overflow-hidden border-l-4 ${getPropertyColors(index)} bg-white shadow-sm`}>
                            <button onClick={() => toggleSection(propertyId)} className={`w-full flex justify-between items-center p-4 text-left font-bold text-lg ${isOpen ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                <span>{propertyName} <span className="text-sm font-medium text-gray-500">({group.tenants.length} inquilini)</span></span>
                                <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOpen && (
                                <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {group.tenants.map(tenant => (
                                        <TenantCard
                                            key={tenant.id}
                                            tenant={tenant}
                                            propertyName={group.property?.name || 'Nessun immobile associato'}
                                            onEdit={() => setEditingTenant(tenant)}
                                            onDelete={() => setDeletingTenant(tenant)}
                                        />
                                    ))}
                                    {group.tenants.length === 0 && (
                                        <p className="text-gray-500 col-span-full text-center">Nessun inquilino trovato per questo immobile.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </Card>

        <AddTenantModal
            isOpen={isAddModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSave={handleAddTenant}
            projectId={projectId}
        />

        {editingTenant && (
            <EditTenantModal
                isOpen={!!editingTenant}
                onClose={() => setEditingTenant(null)}
                onSave={handleUpdateTenant}
                tenant={editingTenant}
                projectId={projectId}
            />
        )}

        {deletingTenant && (
            <ConfirmDeleteModal
                isOpen={!!deletingTenant}
                onClose={() => setDeletingTenant(null)}
                onConfirm={handleDeleteTenant}
                message={`Sei sicuro di voler eliminare l'inquilino "${deletingTenant.name}"?`}
            />
        )}
        </>
    );
};

export default TenantsScreen;