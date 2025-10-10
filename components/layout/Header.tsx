
import React, { useState, useRef, useEffect } from 'react';
import { Menu, UserCircle, Settings, LogOut } from 'lucide-react';
import { User } from '../../types';
import { Screen } from '../../App';

interface HeaderProps {
  currentScreen: string;
  toggleSidebar: () => void;
  user: User;
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, toggleSidebar, user, onLogout, onNavigate }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-20">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-gray-600 mr-4 lg:hidden">
          <Menu size={24} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-dark">{currentScreen}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center text-left rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-700 mr-3 hidden sm:block">
              <span className="font-semibold">{user.name}</span>
            </span>
            <UserCircle size={28} className="text-primary" />
          </button>
          {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 border">
                  <div className="px-4 py-2 border-b">
                      <p className="font-bold text-dark">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <a
                      href="#"
                      onClick={(e) => {
                          e.preventDefault();
                          onNavigate('settings');
                          setDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                      <Settings size={16} className="mr-2" /> Impostazioni
                  </a>
                  <a
                      href="#"
                      onClick={(e) => {
                          e.preventDefault();
                          onLogout();
                      }}
                      className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                      <LogOut size={16} className="mr-2" /> Esci
                  </a>
              </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
