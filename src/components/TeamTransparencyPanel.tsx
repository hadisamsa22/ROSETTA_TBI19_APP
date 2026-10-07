import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Send, 
  FileCheck,
  Building,
  TrendingDown,
  Layers,
  Phone
} from 'lucide-react';
import { 
  AccountingTransaction, 
  TeamMember, 
  TeamDivision 
} from '../types/accounting';
import { formatRupiah, formatDateIndo, generateWhatsAppMessageUrl } from '../utils/formatters';

interface TeamTransparencyPanelProps {
  transactions: AccountingTransaction[];
  currentMember: TeamMember;
  onUpdateApproval: (id: string, status: 'approved' | 'rejected') => void;
  onOpenNewTransaction: () => void;
  currentCashBalance: number;
  divisions: string[];
  teamMembers: TeamMember[];
}

export const TeamTransparencyPanel: React.FC<TeamTransparencyPanelProps> = ({
  transactions,
  currentMember,
  onUpdateApproval,
  onOpenNewTransaction,
  currentCashBalance,
  divisions,
  teamMembers,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

  // Compute expenses by division
  const divisionStats = divisions.map((div) => {
    const list = transactions.filter((t) => t.division === div && t.cash < 0);
    const total = list.reduce((sum, t) => sum + Math.abs(t.cash), 0);
    return {
      division: div,
      count: list.length,
      total,
    };
  });

  const filteredExpenses = transactions.filter((t) => {
    const isExpense = t.cash < 0 || t.type === 'expense';
    const matchDiv = selectedDivision === 'all' || t.division === selectedDivision;
    const matchStatus = statusFilter === 'all' || t.approvalStatus === statusFilter;
    return isExpense && matchDiv && matchStatus;
  });

  const totalExpenseAll = divisionStats.reduce((a, b) => a + b.total, 0);

  const canApprove = currentMember.role === 'keuangan' || currentMember.role === 'ketua_yayasan';

  const handleNotifyWhatsApp = (t: AccountingTransaction) => {
    const url = generateWhatsAppMessageUrl(
      '081803234567', // Pengasuh / Pimpinan
      `[Verifikasi Pengeluaran] ${t.event}`,
      Math.abs(t.cash || t.amount || 0),
      'expense',
      t.recordedBy,
      t.date,
      currentCashBalance
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Transparansi Multi-Pengguna & Tata Kelola Pondok</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            Pengawasan Pengeluaran Tim Antar-Divisi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Setiap rupiah pengeluaran terpantau secara terbuka oleh Pimpinan, Bendahara, Divisi Dapur, Sarpras, dan Tim Audit Wali Santri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
            <span className="text-[10px] text-emerald-700 block font-bold uppercase">Total Belanja Tim</span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
              {formatRupiah(totalExpenseAll)}
            </span>
          </div>
          <button
            onClick={onOpenNewTransaction}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            + Ajukan Pengeluaran
          </button>
        </div>
      </div>

      {/* Grid Profil Tim Pengurus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamMembers.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-2xl border transition ${
              m.id === currentMember.id 
                ? 'bg-amber-50/60 border-amber-400 shadow-sm ring-1 ring-amber-300' 
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500 text-amber-400 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                {m.avatarText}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {m.role === 'keuangan' ? 'Keuangan' : m.role === 'ketua_yayasan' ? 'Ketua Yayasan' : m.role === 'auditor' ? 'Audit' : 'Divisi'}
                  </span>
                  {m.id === currentMember.id && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                      Anda
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-xs mt-1 truncate">
                  {m.name}
                </h4>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {m.roleTitle}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{m.phone}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Pengeluaran per Divisi */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-extrabold text-slate-900 text-sm mb-3">
          Alokasi Pengeluaran Berdasarkan Divisi
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {divisionStats.map((item) => (
            <div
              key={item.division}
              onClick={() => setSelectedDivision(selectedDivision === item.division ? 'all' : item.division)}
              className={`p-3.5 rounded-xl border cursor-pointer transition ${
                selectedDivision === item.division
                  ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-400'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <p className="text-[11px] font-bold text-slate-700 truncate">{item.division}</p>
              <p className="text-sm font-black text-slate-900 font-mono mt-1">
                {formatRupiah(item.total)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {item.count} transaksi dicatat
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabel Pengeluaran Tim dengan Persetujuan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Daftar Pengeluaran & Status Persetujuan Transparansi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap pengeluaran diverifikasi untuk menjaga amanah donatur dan wali santri
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="approved">Sudah Disetujui</option>
              <option value="pending">Menunggu Persetujuan</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {filteredExpenses.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="font-semibold text-slate-600">Tidak ada pengeluaran ditemukan</p>
            </div>
          ) : (
            filteredExpenses.map((t) => (
              <div key={t.id} className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">{formatDateIndo(t.date)}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {t.division || 'Umum'}
                    </span>
                    <span className="text-[10px] text-slate-400">· Kategori: {t.category}</span>
                  </div>

                  <p className="font-bold text-slate-800 text-xs sm:text-sm mt-1">{t.event}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>Diajukan oleh: <strong className="text-slate-700">{t.recordedBy}</strong></span>
                    {t.approvedBy && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-700">Diverifikasi oleh: {t.approvedBy}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-black text-rose-600 font-mono block">
                      -{formatRupiah(Math.abs(t.cash || t.amount || 0))}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Row #{t.rowNum} di Google Sheets
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {t.approvalStatus === 'approved' ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Disetujui</span>
                      </span>
                    ) : (
                      <>
                        {canApprove && (
                          <button
                            onClick={() => onUpdateApproval(t.id, 'approved')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        )}
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1.5 rounded-lg border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      </>
                    )}

                    <button
                      onClick={() => handleNotifyWhatsApp(t)}
                      title="Kirim ke WhatsApp Pengasuh"
                      className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
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
