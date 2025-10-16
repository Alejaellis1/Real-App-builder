
import React from 'react';

interface NavItem {
    name: string;
    icon: React.ReactNode;
}

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: NavItem[];
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, navItems }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-pink-200 p-2 z-20 xl:hidden shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)] overflow-x-auto hide-scrollbar">
      <div className="flex justify-start md:justify-around items-center space-x-2 md:space-x-0">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`relative flex flex-col items-center justify-center gap-1 w-20 h-14 rounded-lg transition-colors flex-shrink-0 ${
              activeTab === item.name
                ? 'text-pink-600'
                : 'text-stone-500 hover:bg-pink-100/50'
            }`}
          >
            <span className="w-6 h-6">{item.icon}</span>
            <span className="text-[10px] font-semibold whitespace-nowrap">{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
