import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  title: React.ReactNode;
  children: React.ReactNode;
  startOpen?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);

    return (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
            >
                <div className="font-semibold text-lg text-dark">{title}</div>
                <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}>
                <div className="border-t">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AccordionItem;