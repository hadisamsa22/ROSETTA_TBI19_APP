import React from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  Volume2, 
  VolumeX,
  ExternalLink 
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatRupiah, formatDateTimeIndo } from '../utils/formatters';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    notifications, 
    unreadCount, 
    soundEnabled, 
    toggleSound, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-sm">Notifikasi Keuangan Otomatis</h3>
              <p className="text-[10px] text-slate-400">Pemberitahuan Transaksi Ponpes Tebuireng 19</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Matikan Suara Chime' : 'Aktifkan Suara Chime'}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="font-semibold text-slate-600">
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua telah dibaca'}
          </span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Dibaca</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] text-rose-600 font-medium hover:underline flex items-center gap-0.5 ml-2"
              >
                <Trash2 className="w-3 h-3" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-xs text-slate-600">Belum ada notifikasi baru</p>
              <p className="text-[11px] text-slate-400">
                Notifikasi akan muncul otomatis saat ada transaksi disimpan atau mutasi bank terdeteksi.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-3.5 rounded-xl transition cursor-pointer mb-1 ${
                  notif.isRead 
                    ? 'bg-white hover:bg-slate-50 opacity-80' 
                    : 'bg-emerald-50/70 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    notif.type === 'income'
                      ? 'bg-emerald-100 text-emerald-700'
                      : notif.type === 'expense'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {notif.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : notif.type === 'expense' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.amount !== undefined && (
                      <p className="font-mono font-black text-xs mt-1 text-slate-900">
                        {formatRupiah(notif.amount)}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100/60 text-[10px] text-slate-400">
                      <span>{formatDateTimeIndo(notif.timestamp)}</span>
                      <span className="text-emerald-700 font-semibold">Tersinkron ke Sheets</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
