import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import { Property } from '../types';
import { MapPin, Home, Bed, Maximize, PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import * as dataService from '../services/dataService';
import AddPropertyModal from '../components/modals/AddPropertyModal';
import EditPropertyModal from '../components/modals/EditPropertyModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

const PropertyCard: React.FC<{ property: Property, onEdit: () => void, onDelete: () => void }> = ({ property, onEdit, onDelete }) => {
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
    <Card className={`border-l-4 ${property.isRented ? 'border-green-500' : 'border-yellow-500'}`}>
      <div className="relative">
        <img className="h-48 w-full object-cover" src={property.imageUrl} alt={property.name} />
        <div ref={menuRef} className="absolute top-2 right-2">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 bg-white/70 rounded-full hover:bg-white transition-colors">
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
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-dark">{property.name}</h3>
            <p className="text-sm text-gray-600 flex items-center"><MapPin size={14} className="mr-1" />{property.address}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${property.isRented ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {property.isRented ? 'Affittato' : 'Libero'}
          </span>
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-700">
          <span className="flex items-center"><Home size={16} className="mr-1 text-primary"/>{property.type}</span>
          <span className="flex items-center"><Bed size={16} className="mr-1 text-primary"/>{property.rooms} vani</span>
          <span className="flex items-center"><Maximize size={16} className="mr-1 text-primary"/>{property.surface} m²</span>
        </div>
        {property.isRented && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Canone di affitto</p>
            <p className="text-xl font-bold text-dark">€{property.rentAmount?.toLocaleString('it-IT')}/mese</p>
          </div>
        )}
      </div>
    </Card>
  );
};


const PropertiesScreen: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = () => {
    setProperties(dataService.getProperties());
  }

  const handleAddProperty = (newPropertyData: Omit<Property, 'id' | 'imageUrl' | 'isRented' | 'rentAmount'>) => {
    dataService.addProperty(newPropertyData);
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
    <div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onEdit={() => setEditingProperty(property)}
            onDelete={() => setDeletingProperty(property)}
          />
        ))}
      </div>

      <AddPropertyModal 
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddProperty={handleAddProperty}
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
          message={`Sei sicuro di voler eliminare l'immobile "${deletingProperty.name}"? Questa azione è irreversibile.`}
        />
      )}
    </div>
  );
};

export default PropertiesScreen;