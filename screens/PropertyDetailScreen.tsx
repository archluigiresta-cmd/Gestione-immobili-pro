
import React, { useState, useEffect } from 'react';
import { Property, Tenant, Contract, Expense, Maintenance, Deadline, Document, ProjectMemberRole, CustomField, CustomFieldType, HistoryLog, User } from '../types';
import * as dataService from '../services/dataService';
import Card from '../components/ui/Card';
import { ArrowLeft, Building2, Square, BedDouble, FileText, CircleDollarSign, Wrench, Calendar, Users, PlusCircle, Edit, Trash2, Info, History, UserCircle } from 'lucide-react';
import AddCustomFieldModal from '../components/modals/AddCustomFieldModal';
import EditCustomFieldModal from '../components/modals/EditCustomFieldModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

interface PropertyDetailScreenProps {
  propertyId: string;
  projectId: string;
  user: User;
  userRole: ProjectMemberRole;
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

const generateId = (prefix: string): string => `${prefix}-${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}`;

// Sub-components for tabs
const ExpensesTab: React.FC<{ expenses: Expense[] }> = ({ expenses }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead><tr className="bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Data</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Descrizione</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Categoria</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-right">Importo</th>
            </tr></thead>
            <tbody>{expenses.map(e => (
                <tr key={e.id} className="border