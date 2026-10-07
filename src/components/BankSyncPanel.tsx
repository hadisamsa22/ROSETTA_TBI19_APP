import React, { useState } from 'react';
import { 
  Building2, 
  RefreshCw, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Upload, 
  FileText, 
  Zap, 
  Sparkles,
  Search,
  Check,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { BankAccount, BankMutation } from '../types/accounting';
import { formatRupiah, formatDateTimeIndo } from '../utils/formatters';

interface BankSyncPanelProps {
  bankAccounts: BankAccount[];
  mutations: BankMutation[];
  onSyncBank: () => void;
  isSyncing: boolean;
  onSimulateIncomingTransaction: () => void;
  onReconcileMutation: (mutation: BankMutation) => void;
  onImportCsv: (csvContent: string, bankAccountId: string) => void;
}

export const BankSyncPanel: React.FC<BankSyncPanelProps> = ({
  bankAccounts,
  mutations,
  onSyncBank,
  isSyncing,
  onSimulateIncomingTransaction,
  onReconcileMutation,
  onImportCsv,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unreconciled' | 'reconciled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [targetBankForImport, setTargetBankForImport] = useState<string>(bankAccounts[0]?.id || '');

  const filteredMutations = mutations.filter((m) => {
    const matchSearch = 
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.senderOrRecipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = 
      filterType === 'all' 
        ? true 
        : filterType === 'unreconciled' 
        ? !m.isReconciled 
        : m.isReconciled;

    const matchAccount = 
      selectedAccountId === 'all' || m.bankAccountId === selectedAccountId;

    return matchSearch && matchType && matchAccount;
  });

  const unreconciledCount = mutations.filter((m) => !m.isReconciled).length;

  const handleCsvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;
    onImportCsv(csvText, targetBankForImport);
    setCsvText('');
    setIsCsvModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Open Banking & Feed Rekonsiliasi Otomatis</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            Sinkronisasi Rekening Bank Ponpes Tebuireng 19
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau dan catat seluruh mutasi debet/kredit rekening BSI & Bank NTB Syariah secara otomatis dan transparan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload Rekening Koran</span>
          </button>

          <button
            onClick={onSimulateIncomingTransaction}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            title="Simulasikan santri bayar SPP atau donatur transfer infaq untuk melihat notifikasi otomatis"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-900" />
            <span>+ Tes Simulasi Mutasi Masuk</span>
          </button>

          <button
            onClick={onSyncBank}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menarik Mutasi...' : 'Tarik Mutasi Terbaru'}</span>
          </button>
        </div>
      </div>

      {/* Rekening Bank Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bankAccounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {acc.bankName}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-2">
                  {acc.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {acc.accountNumber}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  a.n. {acc.accountHolder}
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Saldo Terkini</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {formatRupiah(acc.balance)}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                Sinkron Otomatis
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Daftar Mutasi Bank */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span>Riwayat Mutasi Rekening Bank</span>
              {unreconciledCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreconciledCount} Belum Dicatat ke Jurnal
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik "Catat ke Jurnal" pada mutasi untuk langsung mengonversi transaksi bank ke Persamaan Akuntansi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg transition ${filterType === 'all' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'}`}
              >
                Semua ({mutations.length})
              </button>
              <button
                onClick={() => setFilterType('unreconciled')}
                className={`px-3 py-1 rounded-lg transition ${filterType === 'unreconciled' ? 'bg-white shadow-xs text-amber-700 font-bold' : 'text-slate-600'}`}
              >
                Belum Dicatat ({unreconciledCount})
              </button>
              <button
                onClick={() => setFilterType('reconciled')}
                className={`px-3 py-1 rounded-lg transition ${filterType === 'reconciled' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-slate-600'}`}
              >
                Sudah Dicatat
              </button>
            </div>
          </div>
        </div>

        {/* Search & Account select */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berita transfer, pengirim, referensi..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Rekening Bank</option>
            {bankAccounts.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* List of Bank Mutations */}
        <div className="divide-y divide-slate-100">
          {filteredMutations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="font-semibold text-slate-600 text-xs sm:text-sm">Tidak ada mutasi yang cocok</p>
              <p className="text-xs text-slate-400 mt-1">Gunakan tombol "Tarik Mutasi Terbaru" atau "+ Tes Simulasi Mutasi Masuk".</p>
            </div>
          ) : (
            filteredMutations.map((m) => (
              <div
                key={m.id}
                className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    m.type === 'CR' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {m.type === 'CR' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 text-xs">
                        {m.description}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {m.bankName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>Dari/Tujuan: <strong className="text-slate-700">{m.senderOrRecipient}</strong></span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">{m.date} {m.time}</span>
                      <span>·</span>
                      <span className="font-mono text-[10px] text-slate-400">Ref: {m.referenceNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="text-right">
                    <span className={`font-black font-mono text-sm block ${
                      m.type === 'CR' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {m.type === 'CR' ? '+' : '-'}{formatRupiah(m.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {m.type === 'CR' ? 'Kredit (Masuk)' : 'Debet (Keluar)'}
                    </span>
                  </div>

                  {m.isReconciled ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tercatat</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onReconcileMutation(m)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95"
                    >
                      <span>+ Catat ke Jurnal</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal Upload CSV Rekening Koran */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">
                Upload / Import Rekening Koran Bank
              </h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCsvSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pilih Rekening Bank Tujuan
                </label>
                <select
                  value={targetBankForImport}
                  onChange={(e) => setTargetBankForImport(e.target.value)}
                  className="w-full p-2.5 border rounded-xl font-semibold bg-slate-50"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tempelkan Format CSV Mutasi Bank
                </label>
                <p className="text-[11px] text-slate-400 mb-1.5">
                  Format per baris: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Tanggal, Keterangan, Tipe(CR/DB), Nominal, Pengirim</code>
                </p>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`2026-10-07, "TRF SPP SANTRI ANANDA AHMAD", "CR", 1500000, "WALI SANTRI"\n2026-10-07, "BELANJA TELUR & SAYUR DAPUR", "DB", 850000, "PASAR LABUAPI"`}
                  className="w-full p-2.5 border rounded-xl font-mono text-[11px] focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCsvModalOpen(false)}
                  className="px-3 py-2 border rounded-xl text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-500"
                >
                  Import Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
