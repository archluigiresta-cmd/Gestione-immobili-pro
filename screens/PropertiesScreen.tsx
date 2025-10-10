import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { Property } from '../types';
import { MapPin, Home, Bed, Maximize, PlusCircle } from 'lucide-react';
import * as dataService from '../services/dataService';
import AddPropertyModal from '../components/modals/AddPropertyModal';

const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
  <Card>
    <img className="h-48 w-full object-cover" src={property.imageUrl} alt={property.name} />
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

const PropertiesScreen: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setProperties(dataService.getProperties());
  }, []);

  const handleAddProperty = (newProperty: Omit<Property, 'id' | 'imageUrl' | 'isRented' | 'rentAmount'>) => {
    const addedProperty = dataService.addProperty(newProperty);
    setProperties(prev => [...prev, addedProperty]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Elenco Immobili</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
        >
          <PlusCircle size={18} className="mr-2" />
          Aggiungi Immobile
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <AddPropertyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProperty={handleAddProperty}
      />
    </div>
  );
};

export default PropertiesScreen;