import React from 'react';
import { SoloProLogo } from './icons';

interface NavItem {
    name: string;
    icon: React.ReactNode;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, navItems }) => {
  return (
    <aside className="w-64 bg-white/60 flex-col border-r border-pink-200 backdrop-blur-sm hidden xl:flex fixed top-0 left-0 h-screen z-20">
      <div className="p-6 border-b border-pink-200">
        <SoloProLogo />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <React.Fragment key={item.name}>
            {item.name === 'Settings' && (
              <div className="border-t border-pink-200/60 !my-3" />
            )}
            <button
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === item.name
                  ? 'bg-pink-100 text-pink-700 shadow-md shadow-pink-500/20'
                  : 'text-stone-600 hover:bg-pink-100/50'
              }`}
            >
              <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
              <span className="ml-3 text-left flex-1">{item.name}</span>
            </button>
          </React.Fragment>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;