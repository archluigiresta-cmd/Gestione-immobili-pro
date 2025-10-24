import React, { useState, useEffect } from 'react';
import { Payment, PaymentStatus, Contract, Property } from '@/types';
import { X } from 'lucide-react';
import * as dataService from '@/services/dataService';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<Payment, 'id' | 'history'>) => void;
  projectId: string;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, onClose, onSave, projectId }) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const getInitialState = () => ({
    contractId: '',
    propertyId: '',
    amount: 0,
    paymentDate: '' as string | null,
    dueDate: '',
    referenceMonth: currentMonth,
    referenceYear: currentYear,
    status: PaymentStatus.PENDING,
  });

  const [formData, setFormData] = useState(getInitialState());
  const