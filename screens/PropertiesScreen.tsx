import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
// FIX: Corrected import path to point to the correct file location.
import * as dataService from '../src/services/dataService';
import { Property, ProjectMemberRole, User, PropertyType } from '../types';
import { PlusCircle, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import AddPropertyModal from '../components/modals/AddPropertyModal';
import EditPropertyModal from '../components/modals/EditPropertyModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
// FIX: Corrected import path to point to the correct file location.
import { Screen } from '../src/App';

interface PropertiesScreenProps {
  onNavigate: (screen: Screen, propertyId?: string) => void;
  projectId: string;
  user: User;
  userRole: ProjectMemberRole;
}


const PropertyCard: React.FC<{ property: Property, onEdit: () => void, onDelete: () => void, onView: () => void, disabled: boolean }> = ({ property, onEdit, onDelete, onView, disabled }) => {
    const displayType = (property.type === PropertyType.OTHER && property.typeOther) ? property.typeOther : property.type;
    return (
        <Card className="flex flex-col group">
            <div className="relative">
                <img className="h-48 w-full object-cover" src={property.imageUrl} alt={property.name} />
                <div 
                    onClick={onView} 
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                    <Eye size={32} className="text-white opacity-0 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-300" />
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs font-semibold text-primary">{property.code}</span>
                <h3 className="text-lg font-bold text-dark">{property.name}</h3>
                <p className="text-sm text-gray-500 flex items-center mt-1"><MapPin size={14} className="mr-1.5"/>{property.address}</p>
                
                <div className="mt-2 text-sm text-gray-700">
                    <p>{displayType} - {property.surface} mq - {property.rooms} locali</p>
                </div>
                <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${property.isRented ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {property.isRented ? 'Affittato' : 'Libero'}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent" disabled={disabled}><Edit size={18} /></button>
                        <button onClick={onDelete} className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent" disabled={disabled}><Trash2 size={18} /></button>
                    </div>
                </div>
            </div>
        </Card>
    );
};


const PropertiesScreen: React.FC<PropertiesScreenProps> = ({ onNavigate, projectId, user, userRole }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);

  const isViewer = userRole === ProjectMemberRole.VIEWER;

  useEffect(() => {
    loadProperties();
  }, [projectId]);

  const loadProperties = () => {
    setProperties(dataService.getProperties(projectId));
  };

  const handleAddProperty = (propertyData: Omit<Property, 'id' | 'projectId' | 'customFields' | 'history'>) => {
    const newProperty = dataService.addProperty({ ...propertyData, projectId }, user.id);
    loadProperties();
    setAddModalOpen(false);
    onNavigate('propertyDetail', newProperty.id);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
    dataService.updateProperty(updatedProperty, user.id);
    loadProperties();
    setEditingProperty(null);
  };

  const handleDeleteProperty = () => {
    if (deletingProperty) {
      dataService.deleteProperty(deletingProperty.id);
      loadProperties();
      setDeletingProperty(null);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Elenco Immobili</h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isViewer}
        >
          <PlusCircle size={18} className="mr-2" />
          Aggiungi Immobile
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map(prop => (
          <PropertyCard
            key={prop.id}
            property={prop}
            onView={() => onNavigate('propertyDetail', prop.id)}
            onEdit={() => setEditingProperty(prop)}
            onDelete={() => setDeletingProperty(prop)}
            disabled={isViewer}
          />
        ))}
      </div>
      
      <AddPropertyModal 
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddProperty}
        projectId={projectId}
      />
      {editingProperty && (
        <EditPropertyModal
          isOpen={!!editingProperty}
          onClose={() => setEditingProperty(null)}
          onSave={handleUpdateProperty}
          property={editingProperty}
        />
      )}
      {deletingProperty && (
        <ConfirmDeleteModal
          isOpen={!!deletingProperty}
          onClose={() => setDeletingProperty(null)}
          onConfirm={handleDeleteProperty}
          message={`Sei sicuro di voler eliminare l'immobile "${deletingProperty.name}"?`}
        />
      )}
    </>
  );
};

export default PropertiesScreen;