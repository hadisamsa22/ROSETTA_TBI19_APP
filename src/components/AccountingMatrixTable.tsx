import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Printer, 
  Share2, 
  Download, 
  ArrowUpDown, 
  Plus, 
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Send
} from 'lucide-react';
import { AccountingTransaction, TransactionCategory } from '../types/accounting';
import { formatRupiah, formatDateIndo, generateWhatsAppMessageUrl } from '../utils/formatters';

interface AccountingMatrixTableProps {
  transactions: AccountingTransaction[];
  onDeleteTransaction: (id: string, rowNum: number, event: string) => void;
  onOpenNewTransaction: () => void;
  onPrintReceipt: (tx: AccountingTransaction) => void;
  onExportCsv: () => void;
  currentCashBalance: number;
  divisions?: string[];
}

export const AccountingMatrixTable: React.FC<AccountingMatrixTableProps> = ({
  transactions,
  onDeleteTransaction,
  onOpenNewTransaction,
  onPrintReceipt,
  onExportCsv,
  currentCashBalance,
  divisions = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = 
        t.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.recordedBy && t.recordedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.date && t.date.includes(searchTerm));

      const matchCategory = 
        selectedCategory === 'all' || t.category === selectedCategory;

      const matchDivision = 
        selectedDivision === 'all' || t.division === selectedDivision;

      return matchSearch && matchCategory && matchDivision;
    });
  }, [transactions, searchTerm, selectedCategory, selectedDivision]);

  // Handle WhatsApp Share
  const handleShareWhatsApp = (t: AccountingTransaction) => {
    const amount = t.cash !== 0 ? Math.abs(t.cash) : t.amount || 0;
    const type = t.cash >= 0 ? 'income' : 'expense';
    const url = generateWhatsAppMessageUrl(
      '081917654321', // Default bendahara/grup
      t.event,
      amount,
      type,
      t.recordedBy,
      t.date,
      currentCashBalance
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Table Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Jurnal Persamaan Akuntansi (Rosetta Matrix 12 Akun)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Menampilkan pencatatan akuntansi lengkap Aset (6 Akun) = Kewajiban (3 Akun) + Ekuitas (3 Akun)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi, keterangan, nama pengaju, tanggal..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="Syahriah / SPP Santri">Syahriah / SPP Santri</option>
            <option value="Operasional Dapur & Bahan Pokok">Operasional Dapur</option>
            <option value="Wakaf Pembangunan Gedung & Masjid">Wakaf Pembangunan</option>
            <option value="Infaq & Sedekah Wali/Donatur">Infaq & Sedekah</option>
            <option value="Bisyarah / Honor Asatidz & Karyawan">Bisyarah Asatidz</option>
            <option value="Listrik, Air & Internet Ponpes">Listrik & Air</option>
            <option value="Usaha & Unit Koperasi Ponpes">Koperasi Pondok</option>
            <option value="Pengadaan Aset Tetap">Pengadaan Aset Tetap</option>
          </select>

          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">Semua Divisi Tim</option>
            {divisions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Responsive Matrix Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {/* Top Multi-Header */}
            <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
              <th className="p-3 border border-slate-700 whitespace-nowrap" rowSpan={2}>
                TGL
              </th>
              <th className="p-3 border border-slate-700 min-w-[200px]" rowSpan={2}>
                TRANSAKSI / PERISTIWA
              </th>
              <th className="p-2 border border-slate-700 text-center bg-emerald-950 text-emerald-300" colSpan={6}>
                1. ASSET / AKTIVA
              </th>
              <th className="p-2 border border-slate-700 text-center bg-rose-950 text-rose-300" colSpan={3}>
                2. LIABILITIES (KEWAJIBAN)
              </th>
              <th className="p-2 border border-slate-700 text-center bg-indigo-950 text-indigo-300" colSpan={3}>
                3. EQUITY (EKUITAS)
              </th>
              <th className="p-3 border border-slate-700 text-center whitespace-nowrap" rowSpan={2}>
                AKSI
              </th>
            </tr>
            {/* Sub-Header per Akun */}
            <tr className="bg-slate-800 text-slate-200 font-semibold text-[10px] uppercase">
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-emerald-900/40">Cash</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-emerald-900/40">AR</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-emerald-900/40">Inv</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-emerald-900/40">PPE</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-emerald-900/40">PrePaid</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-emerald-900/40">GodWill</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-rose-900/40">AP</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-rose-900/40">TP</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-rose-900/40">NP</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-indigo-900/40">Origin</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-indigo-900/40">Retained</th>
              <th className="p-2 border border-slate-700 text-right whitespace-nowrap bg-indigo-900/40">Earning</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={15} className="p-10 text-center text-slate-400">
                  {transactions.length === 0 ? (
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-extrabold text-slate-800 text-sm">
                        Buku Kas Bersih & Siap Digunakan
                      </p>
                      <p className="text-xs text-slate-500">
                        Belum ada riwayat transaksi. Klik tombol di bawah untuk mencatat transaksi keuangan pertama Pesantren Sains Tebuireng 19 Lombok.
                      </p>
                      <button
                        onClick={onOpenNewTransaction}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Catat Transaksi Baru</span>
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-slate-600">Tidak ada transaksi yang cocok</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau bersihkan filter.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filteredTransactions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition border-b border-slate-100">
                  {/* Tanggal */}
                  <td className="p-2.5 border-r border-slate-100 text-slate-600 font-mono whitespace-nowrap text-[11px]">
                    {item.date}
                  </td>

                  {/* Keterangan Transaksi & Metadata */}
                  <td className="p-2.5 border-r border-slate-100 min-w-[220px]">
                    <div className="font-bold text-slate-800 leading-snug">{item.event}</div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-500">
                      {item.division && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                          {item.division}
                        </span>
                      )}
                      <span>·</span>
                      <span>Oleh: {item.recordedBy}</span>
                    </div>
                  </td>

                  {/* 1. ASSET (Cash, AR, Inv, PPE, PrePaid, GodWill) */}
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.cash > 0 ? 'font-bold text-emerald-600' : item.cash < 0 ? 'font-bold text-rose-600' : 'text-slate-300'
                  }`}>
                    {item.cash !== 0 ? formatRupiah(item.cash) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.ar !== 0 ? 'font-bold text-emerald-600' : 'text-slate-300'
                  }`}>
                    {item.ar !== 0 ? formatRupiah(item.ar) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.inventory !== 0 ? 'font-bold text-emerald-600' : 'text-slate-300'
                  }`}>
                    {item.inventory !== 0 ? formatRupiah(item.inventory) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.ppe !== 0 ? 'font-bold text-emerald-600' : 'text-slate-300'
                  }`}>
                    {item.ppe !== 0 ? formatRupiah(item.ppe) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.prepaid !== 0 ? 'font-bold text-emerald-600' : 'text-slate-300'
                  }`}>
                    {item.prepaid !== 0 ? formatRupiah(item.prepaid) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.godwill !== 0 ? 'font-bold text-emerald-600' : 'text-slate-300'
                  }`}>
                    {item.godwill !== 0 ? formatRupiah(item.godwill) : '-'}
                  </td>

                  {/* 2. LIABILITIES (AP, TP, NP) */}
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.ap !== 0 ? 'font-bold text-rose-600' : 'text-slate-300'
                  }`}>
                    {item.ap !== 0 ? formatRupiah(item.ap) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.tp !== 0 ? 'font-bold text-rose-600' : 'text-slate-300'
                  }`}>
                    {item.tp !== 0 ? formatRupiah(item.tp) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.np !== 0 ? 'font-bold text-rose-600' : 'text-slate-300'
                  }`}>
                    {item.np !== 0 ? formatRupiah(item.np) : '-'}
                  </td>

                  {/* 3. EQUITY (Origin, Retained, Earning) */}
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.origin !== 0 ? 'font-bold text-indigo-600' : 'text-slate-300'
                  }`}>
                    {item.origin !== 0 ? formatRupiah(item.origin) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.retained !== 0 ? 'font-bold text-indigo-600' : 'text-slate-300'
                  }`}>
                    {item.retained !== 0 ? formatRupiah(item.retained) : '-'}
                  </td>
                  <td className={`p-2 border-r border-slate-100 text-right font-mono whitespace-nowrap ${
                    item.earning > 0 ? 'font-bold text-indigo-600' : item.earning < 0 ? 'font-bold text-rose-600' : 'text-slate-300'
                  }`}>
                    {item.earning !== 0 ? formatRupiah(item.earning) : '-'}
                  </td>

                  {/* Aksi */}
                  <td className="p-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onPrintReceipt(item)}
                        title="Cetak Bukti Kuitansi / Kas"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleShareWhatsApp(item)}
                        title="Kirim Ringkasan ke WhatsApp Tim"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(item.id, item.rowNum, item.event)}
                        title="Hapus Transaksi (Google Sheets & Lokal)"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Menampilkan <strong className="text-slate-800 font-semibold">{filteredTransactions.length}</strong> dari total {transactions.length} entri jurnal.
        </div>
        <div className="flex items-center gap-2">
          <span>*Seluruh entri tersinkronisasi otomatis dengan Google Sheets</span>
        </div>
      </div>

    </div>
  );
};
