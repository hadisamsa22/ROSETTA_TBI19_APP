import React from 'react';
import { 
  Wallet, 
  Receipt, 
  PieChart, 
  Scale, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Building, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Coins,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { AccountingSummary, AccountingMatrix, BankAccount, AccountingTransaction } from '../types/accounting';
import { formatRupiah, formatCompactRupiah, formatDateIndo } from '../utils/formatters';

interface DashboardSummaryProps {
  summary: AccountingSummary;
  assets: { cash: number; ar: number; inventory: number; ppe: number; prepaid: number; godwill: number };
  liabilities: { ap: number; tp: number; np: number };
  equity: { origin: number; retained: number; earning: number };
  bankAccounts: BankAccount[];
  recentTransactions: AccountingTransaction[];
  onOpenNewTransaction: () => void;
  onGoToMatrix: () => void;
  onGoToBank: () => void;
  onTriggerBankSync: () => void;
  isBankSyncing: boolean;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  summary,
  assets,
  liabilities,
  equity,
  bankAccounts,
  recentTransactions,
  onOpenNewTransaction,
  onGoToMatrix,
  onGoToBank,
  onTriggerBankSync,
  isBankSyncing,
}) => {
  const totalBankBalance = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

  // Compute month's income and expense from transactions
  const thisMonthIncome = recentTransactions
    .filter((t) => t.cash > 0)
    .reduce((sum, t) => sum + t.cash, 0);

  const thisMonthExpense = recentTransactions
    .filter((t) => t.cash < 0)
    .reduce((sum, t) => sum + Math.abs(t.cash), 0);

  return (
    <div className="space-y-6">
      
      {/* Hero Pesantren Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md border border-amber-950/40">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img 
            src="/src/assets/images/ponpes_campus_banner_1791369302307.jpg" 
            alt="Kampus Pesantren Sains Tebuireng 19 Lombok" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Pesantren Sains Khairul Wadi · Tebuireng 19 Lombok</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Pesantren Sains Tebuireng 19 Lombok
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sistem Persamaan Dasar Akuntansi Syariah <span className="font-bold text-amber-400">Aset = Kewajiban + Ekuitas</span>. Terintegrasi langsung dengan mutasi rekening bank dan basis data Google Sheets untuk seluruh tim pengurus pesantren.
            </p>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewTransaction}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <span>+ Input Transaksi Baru</span>
            </button>
            <button
              onClick={onGoToBank}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Rekonsiliasi Bank</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Status Keseimbangan & Ringkasan Utama (Persamaan Dasar Akuntansi) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Aset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Aset (Aktiva)
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 font-mono tracking-tight">
                {formatRupiah(summary.totalAssets)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Cash, AR, Inv, PPE, PrePaid</span>
            <span className="font-semibold text-emerald-700">6 Sub-Akun</span>
          </div>
        </div>

        {/* Total Kewajiban */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-rose-300 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Kewajiban
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-rose-600 mt-1 font-mono tracking-tight">
                {formatRupiah(summary.totalLiabilities)}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>AP, TP, NP</span>
            <span className="font-semibold text-rose-700">3 Sub-Akun</span>
          </div>
        </div>

        {/* Total Ekuitas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Ekuitas
              </p>
              <h3 className="text-xl sm:text-2xl font-black text-indigo-600 mt-1 font-mono tracking-tight">
                {formatRupiah(summary.totalEquity)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Origin, Retained, Earning</span>
            <span className="font-semibold text-indigo-700">3 Sub-Akun</span>
          </div>
        </div>

        {/* Status Imbang / Balance */}
        <div className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition ${
          summary.isBalanced 
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
            : 'bg-rose-50/70 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                Status Persamaan Akuntansi
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                {summary.isBalanced ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${
                  summary.isBalanced ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {summary.isBalanced ? 'SEIMBANG (BALANCED)' : 'BELUM SEIMBANG'}
                </h3>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${summary.isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-current/10 flex items-center justify-between text-[11px] font-medium">
            <span>{summary.isBalanced ? 'Aset = Kewajiban + Ekuitas' : `Selisih: ${formatRupiah(summary.difference)}`}</span>
            <span className="font-bold underline cursor-pointer" onClick={onGoToMatrix}>Periksa Matrix</span>
          </div>
        </div>

      </div>

      {/* Saldo Rekening Bank Pondok Terkoneksi */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Rekening Bank & Kas Pondok Pesantren</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sinkronisasi saldo kas langsung dengan rekening bank resmi Yayasan & Pondok
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              Total Likuid: <strong className="text-emerald-700 font-mono">{formatRupiah(totalBankBalance)}</strong>
            </span>
            <button
              onClick={onTriggerBankSync}
              disabled={isBankSyncing}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1.5 transition active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBankSyncing ? 'animate-spin' : ''}`} />
              <span>{isBankSyncing ? 'Menyinkronkan...' : 'Tarik Mutasi Bank'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankAccounts.map((acc) => (
            <div 
              key={acc.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    {acc.bankName}
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs mt-2 line-clamp-1">
                    {acc.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    No. Rek: {acc.accountNumber}
                  </p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mt-1" title="Terkoneksi Aktif" />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Saldo Riil</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                    {formatRupiah(acc.balance)}
                  </span>
                </div>
                <button
                  onClick={onGoToBank}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                >
                  Mutasi →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakdown Sub-Akun (12 Kolom Matrix Rosetta) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Aset / Aktiva */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 mb-3 flex items-center justify-between border-b pb-2.5">
              <span className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Rincian Aset (Aktiva)</span>
              </span>
              <span className="font-mono text-emerald-600 font-bold">{formatRupiah(summary.totalAssets)}</span>
            </h4>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Cash (Kas & Rekening Bank)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(assets.cash)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">AR (Piutang Santri/Donatur)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(assets.ar)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Inventory (Persediaan Kitab/Bahan)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(assets.inventory)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">PPE (Aset Tetap Tanah & Gedung)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(assets.ppe)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">PrePaid (Beban Dibayar Muka)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(assets.prepaid)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">GodWill (Goodwill Yayasan)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(assets.godwill)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Sumber daya ekonomi milik Ponpes Tebuireng 19
          </div>
        </div>

        {/* Kewajiban / Liabilities */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 mb-3 flex items-center justify-between border-b pb-2.5">
              <span className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-600" />
                <span>Rincian Kewajiban (Liabilities)</span>
              </span>
              <span className="font-mono text-rose-600 font-bold">{formatRupiah(summary.totalLiabilities)}</span>
            </h4>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">AP (Utang Usaha / Toko Pemasok)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(liabilities.ap)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">TP (Utang Pajak PPh/PPN)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(liabilities.tp)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">NP (Utang Wesel / Pinjaman Lain)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(liabilities.np)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Kewajiban finansial pihak ketiga yang harus diselesaikan
          </div>
        </div>

        {/* Ekuitas / Equity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 mb-3 flex items-center justify-between border-b pb-2.5">
              <span className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <span>Rincian Ekuitas (Equity)</span>
              </span>
              <span className="font-mono text-indigo-600 font-bold">{formatRupiah(summary.totalEquity)}</span>
            </h4>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Origin (Modal Awal Wakaf Pondok)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(equity.origin)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Retained (Saldo Laba Ditahan)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(equity.retained)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Earning (Surplus Pendapatan Berjalan)</span>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(equity.earning)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Hak residual atas aset ponpes setelah dikurangi seluruh kewajiban
          </div>
        </div>

      </div>

      {/* Ringkasan Arus Kas & Transaksi Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Cash Flow Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center justify-between border-b pb-2">
            <span>Arus Kas Operasional Terkini</span>
            <span className="text-[11px] font-normal text-slate-400">Akumulasi Riil</span>
          </h4>
          
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-emerald-800">Total Pemasukan Kas</p>
                  <p className="text-base font-black text-emerald-700 font-mono">
                    {formatRupiah(thisMonthIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-600 text-white rounded-lg">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-rose-800">Total Pengeluaran Kas</p>
                  <p className="text-base font-black text-rose-700 font-mono">
                    {formatRupiah(thisMonthExpense)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Surplus Kas Bersih</p>
                <p className="text-base font-black text-slate-800 font-mono">
                  {formatRupiah(thisMonthIncome - thisMonthExpense)}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                Kas Surplus
              </span>
            </div>
          </div>
        </div>

        {/* Transaksi Terbaru */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">
                Aktivitas Transaksi Terbaru
              </h4>
              <button 
                onClick={onGoToMatrix}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Lihat Semua ({recentTransactions.length}) →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-700 text-xs">
                    Pembukuan Bersih & Siap Digunakan
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Belum ada transaksi tercatat. Mulai catat transaksi riil pertama Pesantren Sains Tebuireng 19 Lombok dengan menekan tombol di bawah.
                  </p>
                </div>
              ) : (
                recentTransactions.slice(0, 4).map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono">{formatDateIndo(t.date)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {t.division || 'Umum'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 truncate mt-0.5">{t.event}</p>
                      <p className="text-[11px] text-slate-400">Oleh: {t.recordedBy}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`font-black font-mono block ${
                        t.cash > 0 ? 'text-emerald-600' : t.cash < 0 ? 'text-rose-600' : 'text-slate-600'
                      }`}>
                        {t.cash !== 0 ? formatRupiah(t.cash) : formatRupiah(t.amount || 0)}
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                        Disetujui
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sinkronisasi otomatis dengan Google Sheets setiap transaksi dicatat</span>
            <button
              onClick={onOpenNewTransaction}
              className="text-emerald-600 font-bold hover:underline"
            >
              + Catat Sekarang
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
