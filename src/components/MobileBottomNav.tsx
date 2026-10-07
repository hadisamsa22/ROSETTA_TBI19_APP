import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  Building2, 
  Users, 
  Settings,
  Plus
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'dashboard' | 'matrix' | 'bank' | 'team' | 'reports' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'matrix' | 'bank' | 'team' | 'reports' | 'settings') => void;
  onOpenNewTransaction: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-slate-300 px-2 py-1 shadow-2xl">
      <div className="flex items-center justify-around text-[10px] font-semibold">
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dasbor</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            activeTab === 'matrix' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5 mb-0.5" />
          <span>Matrix</span>
        </button>

        {/* Center Floating Plus Button */}
        <button
          onClick={onOpenNewTransaction}
          className="-mt-5 bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 p-3 rounded-full shadow-lg border-2 border-slate-900 active:scale-90 transition font-black"
          title="Catat Transaksi"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            activeTab === 'team' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>Tim</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            activeTab === 'settings' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span>Setting</span>
        </button>

      </div>
    </div>
  );
};
