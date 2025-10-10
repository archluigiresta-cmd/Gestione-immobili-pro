import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Tenant } from '../types';
import { Mail, Phone, Home, PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import AddTenantModal from '../components/modals/AddTenantModal';
import EditTenantModal from '../components/modals/EditTenantModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';


const TenantCard: React.FC<{ tenant: Tenant, onEdit: () => void, onDelete: () => void }> = ({ tenant, onEdit, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const getPropertyByContract = (contractId: string) => {
        const contract = dataService.getContracts().find(c => c.id === contractId);
        if(!contract) return 'Nessun immobile associato';
        return dataService.getProperties().find(p => p.id === contract.propertyId)?.name || 'N/A';
    }
    
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
            <p className="text-sm text-gray-600 flex items-center mt-2"><Home size={14} className="mr-2" /> {getPropertyByContract(tenant.contractId)}</p>
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


const TenantsScreen: React.FC = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

    useEffect(() => {
        loadTenants();
    }, []);

    const loadTenants = () => {
        setTenants(dataService.getTenants());
    };

    const handleAddTenant = (tenantData: Omit<Tenant, 'id'>) => {
        dataService.addTenant(tenantData);
        loadTenants();
        setAddModalOpen(false);
    };

    const handleUpdateTenant = (updatedTenant: Tenant) => {
        dataService.updateTenant(updatedTenant);
        loadTenants();
        setEditingTenant(null);
    };

    const handleDeleteTenant = () => {
        if (deletingTenant) {
            dataService.deleteTenant(deletingTenant.id);
            loadTenants();
            setDeletingTenant(null);
        }
    };

    return (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenants.map((tenant: Tenant) => (
                    <TenantCard 
                        key={tenant.id} 
                        tenant={tenant}
                        onEdit={() => setEditingTenant(tenant)}
                        onDelete={() => setDeletingTenant(tenant)}
                    />
                ))}
            </div>

            <AddTenantModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSave={handleAddTenant}
            />

            {editingTenant && (
                <EditTenantModal
                    isOpen={!!editingTenant}
                    onClose={() => setEditingTenant(null)}
                    onSave={handleUpdateTenant}
                    tenant={editingTenant}
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
        </Card>
    );
};

export default TenantsScreen;
