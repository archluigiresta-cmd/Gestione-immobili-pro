

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Tenant, User, Property, Contract } from '../types';
import { Mail, Phone, Home, PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import AddTenantModal from '../components/modals/AddTenantModal';
import EditTenantModal from '../components/modals/EditTenantModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import AccordionItem from '../components/ui/AccordionItem';

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

    const groupedTenants = useMemo(() => {
        const contractMap = new Map(contracts.map(c => [c.id, c.propertyId]));
        const propertyMap = new Map(properties.map(p => [p.id, p.name]));

        const enriched = tenants.map(tenant => {
            const propertyId = contractMap.get(tenant.contractId);
            const propertyName = propertyId ? propertyMap.get(propertyId) || 'N/A' : 'N/A';
            return { tenant, propertyId, propertyName };
        });

        return enriched.reduce((acc, item) => {
            const key = item.propertyId || 'unassigned';
            if (!acc[key]) acc[key] = [];
            acc[key].push({ ...item.tenant, propertyName: item.propertyName });
            return acc;
        }, {} as Record<string, (Tenant & { propertyName: string })[]>);

    }, [tenants, contracts, properties]);


    return (
        <>
        <div className="space-y-6">
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
                {properties.filter(p => groupedTenants[p.id]).map(property => {
                     const propertyTenants = groupedTenants[property.id];
                     const title = (
                        <div className="flex items-center gap-3">
                            <span>{property.name}</span>
                            <span className="text-sm bg-gray-200 text-gray-700 font-bold px-2.5 py-1 rounded-full">{propertyTenants.length}</span>
                        </div>
                    );
                    return (
                        <AccordionItem key={property.id} title={title}>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-4">
                                {propertyTenants.map(tenant => (
                                     <TenantCard
                                        key={tenant.id}
                                        tenant={tenant}
                                        propertyName={tenant.propertyName}
                                        onEdit={() => setEditingTenant(tenant)}
                                        onDelete={() => setDeletingTenant(tenant)}
                                    />
                                ))}
                             </div>
                        </AccordionItem>
                    )
                })}
                {Object.keys(groupedTenants).length === 0 && (
                    <Card className="p-8 text-center text-gray-500">
                        Nessun inquilino trovato.
                    </Card>
                )}
            </div>
        </div>

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