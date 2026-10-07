import React from 'react';
import { 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Scale, 
  PieChart, 
  TrendingUp, 
  Building2,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { 
  AccountingSummary, 
  AccountingTransaction 
} from '../types/accounting';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface FinancialReportsViewProps {
  summary: AccountingSummary;
  assets: { cash: number; ar: number; inventory: number; ppe: number; prepaid: number; godwill: number };
  liabilities: { ap: number; tp: number; np: number };
  equity: { origin: number; retained: number; earning: number };
  transactions: AccountingTransaction[];
  onExportCsv: () => void;
}

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  summary,
  assets,
  liabilities,
  equity,
  transactions,
  onExportCsv,
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Group transactions by category
  const categoryTotals: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((t) => {
    const cat = t.category || 'Lainnya';
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = { income: 0, expense: 0 };
    }
    if (t.cash > 0) {
      categoryTotals[cat].income += t.cash;
    } else if (t.cash < 0) {
      categoryTotals[cat].expense += Math.abs(t.cash);
    }
  });

  const totalIncome = Object.values(categoryTotals).reduce((a, b) => a + b.income, 0);
  const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b.expense, 0);
  const netSurplus = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            Laporan Keuangan & Neraca Pondok
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan akuntansi resmi sesuai Persamaan Dasar Akuntansi Syariah Ponpes Tebuireng 19 Lombok
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV Google Sheets</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Cetak PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* Official Report Document */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-8 print:border-0 print:p-0">
        
        {/* Kop Laporan */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img 
              src="/src/assets/images/logo_pesantren_sains_tbi19_1791371351141.jpg" 
              alt="Logo Pesantren Sains" 
              className="w-14 h-18 object-contain"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div className="text-left">
              <h1 className="text-base sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                PESANTREN SAINS TEBUIRENG 19 LOMBOK
              </h1>
              <p className="text-xs text-amber-700 font-bold uppercase tracking-wide">
                Khairul Wadi · Kecamatan Labuapi, Kabupaten Lombok Barat, NTB
              </p>
              <p className="text-[11px] text-slate-600 font-semibold">
                Laporan Pertanggungjawaban Keuangan & Posisi Akuntansi Terpadu
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-2">
            Periode Berjalan: Tahun Ajaran 2026/2027 · Basis Data: Google Sheets Terpusat
          </p>
        </div>

        {/* 1. Laporan Posisi Keuangan (Neraca) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <span>1. Laporan Neraca Keuangan ($Aset = Kewajiban + Ekuitas$)</span>
            </h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              summary.isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {summary.isBalanced ? '✓ Seimbang (Balanced)' : '✗ Belum Seimbang'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Sisi Kiri: AKTIVA / ASET */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
              <h4 className="font-black text-emerald-800 uppercase tracking-wider text-xs border-b pb-1.5 flex justify-between">
                <span>AKTIVA / ASET</span>
                <span>JUMLAH</span>
              </h4>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Cash & Rekening Bank (BSI/NTB Syariah)</span>
                  <span className="font-mono font-bold">{formatRupiah(assets.cash)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Piutang (AR - Syahriah/Donatur)</span>
                  <span className="font-mono font-bold">{formatRupiah(assets.ar)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Persediaan (Inventory - Kitab/Beras)</span>
                  <span className="font-mono font-bold">{formatRupiah(assets.inventory)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Aset Tetap (PPE - Tanah, Gedung, Sarpras)</span>
                  <span className="font-mono font-bold">{formatRupiah(assets.ppe)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Beban Dibayar Muka (PrePaid)</span>
                  <span className="font-mono font-bold">{formatRupiah(assets.prepaid)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Goodwill & Aset Tak Berwujud</span>
                  <span className="font-mono font-bold">{formatRupiah(assets.godwill)}</span>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between font-black text-emerald-800 text-sm">
                <span>TOTAL ASET (AKTIVA):</span>
                <span className="font-mono">{formatRupiah(summary.totalAssets)}</span>
              </div>
            </div>

            {/* Sisi Kanan: KEWAJIBAN & EKUITAS (PASIVA) */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3">
              <h4 className="font-black text-rose-800 uppercase tracking-wider text-xs border-b pb-1.5 flex justify-between">
                <span>KEWAJIBAN & EKUITAS (PASIVA)</span>
                <span>JUMLAH</span>
              </h4>
              
              <div className="space-y-1.5">
                <span className="font-bold text-[11px] text-slate-500 uppercase block">Kewajiban (Liabilities):</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Utang Usaha / AP (Pemasok)</span>
                  <span className="font-mono font-bold">{formatRupiah(liabilities.ap)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Utang Pajak / TP</span>
                  <span className="font-mono font-bold">{formatRupiah(liabilities.tp)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Utang Wesel / NP</span>
                  <span className="font-mono font-bold">{formatRupiah(liabilities.np)}</span>
                </div>

                <span className="font-bold text-[11px] text-slate-500 uppercase block pt-2">Ekuitas (Equity):</span>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Origin (Modal Awal Yayasan/Tanah Wakaf)</span>
                  <span className="font-mono font-bold">{formatRupiah(equity.origin)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Retained (Saldo Laba Ditahan)</span>
                  <span className="font-mono font-bold">{formatRupiah(equity.retained)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Earning (Surplus Pendapatan Berjalan)</span>
                  <span className="font-mono font-bold">{formatRupiah(equity.earning)}</span>
                </div>
              </div>

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between font-black text-slate-900 text-sm">
                <span>TOTAL PASIVA (KEWAJIBAN + EKUITAS):</span>
                <span className="font-mono">{formatRupiah(summary.totalLiabilities + summary.totalEquity)}</span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Rekapitulasi per Kategori Operasional */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2 border-b pb-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span>2. Rekapitulasi Pemasukan & Pengeluaran Berdasarkan Kategori</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                  <th className="p-2.5">KATEGORI DANA</th>
                  <th className="p-2.5 text-right">PEMASUKAN</th>
                  <th className="p-2.5 text-right">PENGELUARAN</th>
                  <th className="p-2.5 text-right">SELISIH / NET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(categoryTotals).map(([cat, val]) => (
                  <tr key={cat} className="hover:bg-slate-50">
                    <td className="p-2 font-medium text-slate-800">{cat}</td>
                    <td className="p-2 text-right font-mono text-emerald-600 font-bold">{val.income > 0 ? formatRupiah(val.income) : '-'}</td>
                    <td className="p-2 text-right font-mono text-rose-600 font-bold">{val.expense > 0 ? formatRupiah(val.expense) : '-'}</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">{formatRupiah(val.income - val.expense)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 font-black border-t-2 border-slate-300 text-xs">
                  <td className="p-2.5">TOTAL KESELURUHAN</td>
                  <td className="p-2.5 text-right font-mono text-emerald-700">{formatRupiah(totalIncome)}</td>
                  <td className="p-2.5 text-right font-mono text-rose-700">{formatRupiah(totalExpense)}</td>
                  <td className="p-2.5 text-right font-mono text-slate-900">{formatRupiah(netSurplus)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Tanda Tangan Resmi Pengurus */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs border-t border-slate-200">
          <div>
            <p className="text-slate-500">Lombok Barat, {formatDateIndo(new Date().toISOString().split('T')[0])}</p>
            <p className="font-bold text-slate-800 mt-1">Bagian Keuangan / Bendahara</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Stempel]</span>
            </div>
            <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[200px]">
              Ust. Firman
            </p>
          </div>

          <div>
            <p className="text-slate-500">Mengetahui & Menyetujui,</p>
            <p className="font-bold text-slate-800 mt-1">Ketua Yayasan</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Stempel]</span>
            </div>
            <p className="font-bold text-slate-900 border-t border-slate-300 pt-1 inline-block min-w-[200px]">
              Ust. Herman Zuhdi
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
