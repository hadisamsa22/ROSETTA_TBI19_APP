import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { AccountingTransaction } from '../types/accounting';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface ReceiptPrintModalProps {
  transaction: AccountingTransaction | null;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const isIncome = transaction.cash > 0;
  const nominal = Math.abs(transaction.cash !== 0 ? transaction.cash : transaction.amount || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between no-print">
          <span className="font-bold text-xs">Cetak Bukti Transaksi Keuangan</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 font-sans print:p-0">
          
          {/* Receipt Header Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <img 
                src="/src/assets/images/logo_pesantren_sains_tbi19_1791371351141.jpg" 
                alt="Logo Pesantren Sains" 
                className="w-12 h-15 object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <div className="text-left">
                <h2 className="font-black text-sm sm:text-base text-slate-950 uppercase tracking-tight">
                  PESANTREN SAINS TEBUIRENG 19 LOMBOK
                </h2>
                <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wide">
                  Khairul Wadi · Lombok Barat, NTB
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Sistem Akuntansi Keuangan Berbasis Google Sheets
                </p>
              </div>
            </div>
            
            <div className="mt-3 py-1 bg-slate-100 rounded text-center">
              <h3 className="font-extrabold text-xs tracking-wider uppercase">
                {isIncome ? 'BUKTI KAS MASUK (BKM)' : 'BUKTI KAS KELUAR (BKK)'}
              </h3>
            </div>
          </div>

          {/* Receipt Meta */}
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-slate-500 text-[11px]">No. Transaksi:</p>
              <p className="font-mono font-bold text-slate-900">#TB19-{transaction.rowNum || '00'}-{transaction.id.slice(-4)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-[11px]">Tanggal:</p>
              <p className="font-semibold text-slate-900">{formatDateIndo(transaction.date)}</p>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="space-y-3 text-xs border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Peristiwa / Transaksi:</span>
              <span className="font-bold text-slate-900 text-right max-w-[240px]">{transaction.event}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Kategori Dana:</span>
              <span className="font-semibold text-slate-800">{transaction.category || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500">Divisi Pengaju:</span>
              <span className="font-semibold text-slate-800">{transaction.division || 'Umum'}</span>
            </div>
            <div className="flex justify-between pt-1 items-center">
              <span className="text-slate-700 font-bold text-sm">Jumlah Nominal:</span>
              <span className="text-lg font-black font-mono text-emerald-700">
                {formatRupiah(nominal)}
              </span>
            </div>
          </div>

          {/* Rosetta Matrix Impact Info */}
          <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg font-mono">
            <span>Dampak Matrix: </span>
            {transaction.cash !== 0 && <span>Cash ({transaction.cash > 0 ? '+' : ''}{transaction.cash}) </span>}
            {transaction.earning !== 0 && <span>Earning ({transaction.earning > 0 ? '+' : ''}{transaction.earning}) </span>}
            {transaction.ppe !== 0 && <span>PPE (+{transaction.ppe}) </span>}
            {transaction.inventory !== 0 && <span>Inv (+{transaction.inventory}) </span>}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 text-center text-xs">
            <div>
              <p className="text-[11px] text-slate-500">Mengetahui & Menyetujui,</p>
              <p className="text-[11px] font-bold text-slate-800">Ketua Yayasan</p>
              <div className="h-14 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">[Tanda Tangan & Stempel]</span>
              </div>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                Ust. Herman Zuhdi
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-500">Pencatat / Kasir,</p>
              <p className="text-[11px] font-bold text-slate-800">Bagian Keuangan</p>
              <div className="h-14 flex items-center justify-center">
                <span className="text-[10px] text-slate-300 italic">[Tanda Tangan]</span>
              </div>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                {transaction.recordedBy || 'Ust. Firman'}
              </p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            Dokumen sah dicetak secara digital dari Sistem Keuangan Pesantren Sains Tebuireng 19 Lombok
          </div>

        </div>

      </div>
    </div>
  );
};
