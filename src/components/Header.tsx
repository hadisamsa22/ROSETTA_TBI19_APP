import React, { useState } from 'react';
import { 
  Building2, 
  Database, 
  Bell, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  SlidersHorizontal,
  Volume2,
  VolumeX,
  ChevronDown,
  Settings
} from 'lucide-react';
import { TeamMember } from '../types/accounting';
import { PonpesLogo } from './PonpesLogo';
import { useNotifications } from '../context/NotificationContext';

interface HeaderProps {
  activeTab: 'dashboard' | 'matrix' | 'bank' | 'team' | 'reports' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'matrix' | 'bank' | 'team' | 'reports' | 'settings') => void;
  onOpenNewTransaction: () => void;
  onOpenSheetsConfig: () => void;
  isOnlineWithSheets: boolean;
  isSyncing: boolean;
  onManualSync: () => void;
  currentMember: TeamMember;
  onSelectMember: (member: TeamMember) => void;
  onOpenNotifications: () => void;
  teamMembers: TeamMember[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
  onOpenSheetsConfig,
  isOnlineWithSheets,
  isSyncing,
  onManualSync,
  currentMember,
  onSelectMember,
  onOpenNotifications,
  teamMembers,
}) => {
  const { unreadCount, soundEnabled, toggleSound } = useNotifications();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-amber-950/40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Zone 1: Single text element wordmark with Ponpes Sains identity */}
          <div className="flex items-center gap-3">
            <PonpesLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                  Pesantren Sains Tebuireng 19
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60 hidden sm:inline-block">
                  Khairul Wadi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Lombok Barat · Sistem Akuntansi & Sinkronisasi Bank Terpadu
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-800/80 text-emerald-100 shadow-sm border border-emerald-700/50 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Dasbor
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-emerald-800/80 text-emerald-100 shadow-sm border border-emerald-700/50 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Jurnal Matrix (12 Akun)
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'bank'
                  ? 'bg-emerald-800/80 text-emerald-100 shadow-sm border border-emerald-700/50 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Sinkronisasi Bank
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'team'
                  ? 'bg-emerald-800/80 text-emerald-100 shadow-sm border border-emerald-700/50 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Pengeluaran Tim
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-emerald-800/80 text-emerald-100 shadow-sm border border-emerald-700/50 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Laporan & Cetak
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-amber-600 text-slate-900 shadow-sm font-extrabold'
                  : 'text-amber-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Google Sheets Status Pill / Button */}
            <button
              onClick={onOpenSheetsConfig}
              title="Konfigurasi Google Sheets API"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700/70 transition"
            >
              <Database className={`w-3.5 h-3.5 ${isOnlineWithSheets ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden xl:inline">
                {isOnlineWithSheets ? 'Sheets: Terhubung' : 'Sheets: Cache'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isOnlineWithSheets ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Manual Sync Icon Button */}
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              title="Sinkronkan data ke Google Sheets"
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            {/* Notification Bell Button */}
            <button
              onClick={onOpenNotifications}
              title="Notifikasi Transaksi Otomatis"
              className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Notifikasi Suara: Aktif' : 'Notifikasi Suara: Senyap'}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition hidden sm:inline-flex"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500 text-[10px] text-slate-900 flex items-center justify-center font-black">
                  {currentMember.avatarText}
                </div>
                <span className="hidden xl:inline max-w-[120px] truncate">{currentMember.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs divide-y divide-slate-700/60"
                  onClick={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Pengguna Aktif</p>
                      <p className="text-white font-bold">{currentMember.name}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Kelola →
                    </button>
                  </div>
                  <div className="py-1">
                    {teamMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => onSelectMember(m)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition ${
                          m.id === currentMember.id ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-200 hover:bg-slate-700/70'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500 text-amber-400 text-[10px] flex items-center justify-center font-bold shrink-0">
                          {m.avatarText}
                        </div>
                        <div className="truncate">
                          <p className="leading-tight truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">{m.roleTitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={onOpenNewTransaction}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 text-xs whitespace-nowrap active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Catat Transaksi</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
