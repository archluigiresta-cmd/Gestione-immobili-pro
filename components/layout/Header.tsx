
import React, { useState, useRef, useEffect } from 'react';
import { Menu, UserCircle, Settings, LogOut, Briefcase, Bell } from 'lucide-react';
import { User } from '../../types';
// FIX: Corrected import path to point to App.tsx inside the src directory.
import { Screen } from '../../src/App';

interface HeaderProps {
  currentScreen: string;
  currentProjectName: string;
  toggleSidebar: () => void;
  user: User;
  onLogout: () => void;
  onNavigate: (screen: Screen) => void;
  onBackToProjects: () => void;
  pendingUsersCount: number;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, currentProjectName, toggleSidebar, user, onLogout, onNavigate, onBackToProjects, pendingUsersCount }) => {
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
        <div>
            <h1 className="text-xl md:text-2xl font-bold text-dark">{currentScreen}</h1>
            <p className="text-xs text-gray-500 font-medium">{currentProjectName}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user.id === 'user-1' && pendingUsersCount > 0 && (
          <button
            onClick={() => onNavigate('settings')}
            className="relative text-gray-600 hover:text-primary p-2 rounded-full hover:bg-gray-100"
            title={`${pendingUsersCount} utenti in attesa di approvazione`}
          >
            <Bell size={22} />
            <span className="absolute top-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                {pendingUsersCount}
              </span>
            </span>
          </button>
        )}
        <button 
            onClick={onBackToProjects}
            className="hidden sm:flex items-center text-sm px-3 py-2 bg-secondary text-primary font-semibold rounded-lg hover:bg-blue-200 transition-colors"
        >
            <Briefcase size={16} className="mr-2"/> Cambia Progetto
        </button>
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
                          onBackToProjects();
                          setDropdownOpen(false);
                      }}
                       className="flex sm:hidden items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                      <Briefcase size={16} className="mr-2" /> Cambia Progetto
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