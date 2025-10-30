import React from 'react';
import { navigationItems, secondaryNavigationItems, type Screen } from '../../types';
import { X } from 'lucide-react';

interface SidebarProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onInstall: () => void;
  isInstallable: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeScreen, setActiveScreen, isSidebarOpen, setSidebarOpen, onInstall, isInstallable }) => {
  const NavItem: React.FC<{ item: (typeof navigationItems)[number] | (typeof secondaryNavigationItems)[number] }> = ({ item }) => {
    const isInstallButton = item.screen === 'install';
    const isDisabled = isInstallButton && !isInstallable;

    const handleClick = () => {
      if (isDisabled) return;
      if (isInstallButton) {
        onInstall();
      } else {
        setActiveScreen(item.screen as Screen);
      }
      setSidebarOpen(false);
    };

    return (
      <li
        onClick={handleClick}
        className={`
          flex items-center p-3 my-1 rounded-lg transition-colors duration-200
          ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 
            activeScreen === item.screen ? 'bg-primary text-white shadow-lg' : 'text-gray-600 hover:bg-secondary hover:text-primary cursor-pointer'
          }
        `}
      >
        <item.icon className="w-6 h-6 mr-3" />
        <span className="font-medium">{item.name}</span>
      </li>
    );
  };
  
  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`
        absolute lg:relative z-40 lg:z-auto bg-white shadow-xl
        flex flex-col h-full transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 w-64
      `}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold text-primary">Gest-Immo</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul>
            {navigationItems.map(item => (
              <NavItem key={item.screen} item={item} />
            ))}
          </ul>
           <hr className="my-4" />
          <ul>
            {secondaryNavigationItems.map(item => (
              <NavItem key={item.screen} item={item} />
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <p className="text-xs text-gray-500 text-center">&copy; 2024 Gestore Immobili PRO</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;