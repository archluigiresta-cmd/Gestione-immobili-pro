
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as dataService from '../services/dataService';
import { Property } from '../types';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import AddPropertyModal from '../components/modals/AddPropertyModal';
import EditPropertyModal from '../components/modals/EditPropertyModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { Screen } from '../App';

interface PropertiesScreenProps {
  onNavigate: (screen: Screen, propertyId?: string) => void;
}


const PropertyCard: React.FC<{ property: Property, onEdit: () => void, onDelete: () => void, onView: () => void }> = ({ property, onEdit, onDelete, onView }) => {
    return (
        <Card className="flex flex-col">
            <img className="h-48 w-full object-cover" src={property.imageUrl} alt={property.name} />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-dark">{property.name}</h3>
                <p className="text-sm text-gray-500">{property.address}</p>
                <div className="mt-2 text-sm text-gray-700">
                    <p>{property.type} - {property.surface} mq - {property.rooms} locali</p>
                </div>
                <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${property.isRented ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {property.isRented ? 'Affittato' : 'Libero'}
                    </span>
                    <div className="flex gap-2">
                        <button onClick={onView} className="text-gray-500 hover:text-primary"><Eye size={18} /></button>
                        <button onClick={onEdit} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                        <button onClick={onDelete} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </div>
                </div>
            </div>
        </Card>
    );
};


const PropertiesScreen: React.FC<PropertiesScreenProps> = ({ onNavigate }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = () => {
    setProperties(dataService.getProperties());
  };

  const handleAddProperty = (propertyData: Omit<Property, 'id'>) => {
    dataService.addProperty(propertyData);
    loadProperties();
    setAddModalOpen(false);
  };

  const handleUpdateProperty = (updatedProperty: Property) => {
    dataService.updateProperty(updatedProperty);
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
          className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
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
          />
        ))}
      </div>
      
      <AddPropertyModal 
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddProperty}
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
