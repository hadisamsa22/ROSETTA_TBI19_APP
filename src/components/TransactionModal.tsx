import React, { useState } from 'react';
import { 
  X, 
  Save, 
  HelpCircle, 
  Calculator, 
  Zap, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Send,
  Sparkles
} from 'lucide-react';
import { 
  AccountingTransaction, 
  TransactionCategory, 
  TeamDivision, 
  BankAccount, 
  TeamMember 
} from '../types/accounting';
import { formatRupiah } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: Omit<AccountingTransaction, 'rowNum' | 'id'>) => Promise<void>;
  bankAccounts: BankAccount[];
  currentMember: TeamMember;
  divisions: string[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bankAccounts,
  currentMember,
  divisions,
}) => {
  if (!isOpen) return null;

  const [inputMode, setInputMode] = useState<'quick' | 'matrix'>('quick');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Fields
  const [event, setEvent] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<TransactionCategory>('Operasional Dapur Santri');
  const [division, setDivision] = useState<TeamDivision>(divisions[0] || 'Dapur & Konsumsi Santri');
  const [selectedBankId, setSelectedBankId] = useState<string>(bankAccounts[0]?.id || 'bsi-operasional');
  const [notes, setNotes] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // Quick Mode Fields
  const [quickType, setQuickType] = useState<'income' | 'expense' | 'asset' | 'liability'>('expense');
  const [quickAmount, setQuickAmount] = useState<string>('');

  // Matrix Mode Fields (12 Rosetta Accounts)
  const [matrixData, setMatrixData] = useState({
    cash: '',
    ar: '',
    inventory: '',
    ppe: '',
    prepaid: '',
    godwill: '',
    ap: '',
    tp: '',
    np: '',
    origin: '',
    retained: '',
    earning: '',
  });

  const handleMatrixChange = (field: keyof typeof matrixData, value: string) => {
    setMatrixData((prev) => ({ ...prev, [field]: value }));
  };

  // Matrix Balance Validation
  const sumAssets = 
    (Number(matrixData.cash) || 0) +
    (Number(matrixData.ar) || 0) +
    (Number(matrixData.inventory) || 0) +
    (Number(matrixData.ppe) || 0) +
    (Number(matrixData.prepaid) || 0) +
    (Number(matrixData.godwill) || 0);

  const sumLiabilities = 
    (Number(matrixData.ap) || 0) +
    (Number(matrixData.tp) || 0) +
    (Number(matrixData.np) || 0);

  const sumEquity = 
    (Number(matrixData.origin) || 0) +
    (Number(matrixData.retained) || 0) +
    (Number(matrixData.earning) || 0);

  const isMatrixBalanced = Math.abs(sumAssets - (sumLiabilities + sumEquity)) < 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.trim()) return;

    setIsSubmitting(true);

    try {
      let finalCash = 0;
      let finalAr = 0;
      let finalInventory = 0;
      let finalPpe = 0;
      let finalPrepaid = 0;
      let finalGodwill = 0;
      let finalAp = 0;
      let finalTp = 0;
      let finalNp = 0;
      let finalOrigin = 0;
      let finalRetained = 0;
      let finalEarning = 0;
      let finalAmount = 0;

      if (inputMode === 'quick') {
        const amt = parseFloat(quickAmount.replace(/[^0-9]/g, '')) || 0;
        finalAmount = amt;

        if (quickType === 'income') {
          finalCash = amt;
          finalEarning = amt;
        } else if (quickType === 'expense') {
          finalCash = -amt;
          finalEarning = -amt;
        } else if (quickType === 'asset') {
          finalCash = -amt;
          if (category === 'Usaha & Unit Koperasi Pesantren') {
            finalInventory = amt;
          } else {
            finalPpe = amt;
          }
        } else if (quickType === 'liability') {
          finalCash = -amt;
          finalAp = -amt;
        }
      } else {
        finalCash = Number(matrixData.cash) || 0;
        finalAr = Number(matrixData.ar) || 0;
        finalInventory = Number(matrixData.inventory) || 0;
        finalPpe = Number(matrixData.ppe) || 0;
        finalPrepaid = Number(matrixData.prepaid) || 0;
        finalGodwill = Number(matrixData.godwill) || 0;
        finalAp = Number(matrixData.ap) || 0;
        finalTp = Number(matrixData.tp) || 0;
        finalNp = Number(matrixData.np) || 0;
        finalOrigin = Number(matrixData.origin) || 0;
        finalRetained = Number(matrixData.retained) || 0;
        finalEarning = Number(matrixData.earning) || 0;
        finalAmount = Math.abs(finalCash) || Math.abs(finalEarning) || Math.abs(finalPpe) || 0;
      }

      await onSubmit({
        date,
        event: event.trim(),
        category,
        division,
        type: quickType,
        amount: finalAmount,
        recordedBy: currentMember.name,
        approvalStatus: 'approved',
        bankAccountRef: selectedBankId,
        notes: notes.trim(),
        cash: finalCash,
        ar: finalAr,
        inventory: finalInventory,
        ppe: finalPpe,
        prepaid: finalPrepaid,
        godwill: finalGodwill,
        ap: finalAp,
        tp: finalTp,
        np: finalNp,
        origin: finalOrigin,
        retained: finalRetained,
        earning: finalEarning,
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Input Transaksi Keuangan Baru
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                Pesantren Sains Tebuireng 19 Lombok · Sinkron Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 shrink-0 flex items-center justify-between gap-2">
          <div className="flex gap-1.5 bg-slate-200 p-1 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setInputMode('quick')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                inputMode === 'quick'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Mode Cepat (Pemasukan / Pengeluaran)</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('matrix')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                inputMode === 'matrix'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Mode Lengkap Rosetta (12 Akun)</span>
            </button>
          </div>
          <span className="hidden sm:inline text-[11px] text-slate-500 font-medium">
            Oleh: {currentMember.name.split(',')[0]}
          </span>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* Baris 1: Keterangan & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Keterangan Transaksi / Peristiwa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="Contoh: Penerimaan Syahriah Santri Fauzan / Belanja Beras 20 Karung"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* MODE CEPAT (SMART AUTO MAPPING) */}
          {inputMode === 'quick' ? (
            <div className="space-y-4">
              
              {/* Tipe Transaksi Quick */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Jenis Transaksi Keuangan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => { setQuickType('income'); setCategory('Syahriah / SPP Santri'); }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      quickType === 'income'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <span className="block text-emerald-600 text-sm">↓ Pemasukan</span>
                    <span className="text-[10px] font-normal text-slate-500">SPP, Infaq, Donasi, Wakaf</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setQuickType('expense'); setCategory('Operasional Dapur Santri'); }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      quickType === 'expense'
                        ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <span className="block text-rose-600 text-sm">↑ Pengeluaran</span>
                    <span className="text-[10px] font-normal text-slate-500">Dapur, Bisyarah, Listrik</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setQuickType('asset'); setCategory('Pengadaan Aset Tetap'); }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      quickType === 'asset'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-500/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <span className="block text-indigo-600 text-sm">🏛 Beli Aset</span>
                    <span className="text-[10px] font-normal text-slate-500">Gedung, Kitab, Lemari</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setQuickType('liability'); setCategory('Lainnya'); }}
                    className={`p-2.5 rounded-xl border text-left font-bold transition ${
                      quickType === 'liability'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                    }`}
                  >
                    <span className="block text-amber-600 text-sm">🤝 Bayar Utang</span>
                    <span className="text-[10px] font-normal text-slate-500">Pelunasan Toko / Vendor</span>
                  </button>
                </div>
              </div>

              {/* Nominal & Rekening Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nominal Transaksi (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Contoh: 1500000"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  {quickAmount && (
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      Terbaca: {formatRupiah(quickAmount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Rekening Bank / Kas Sumber
                  </label>
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountNumber} ({formatRupiah(b.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kategori & Divisi Tim */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kategori Keuangan Pesantren
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Syahriah / SPP Santri">Syahriah / SPP Santri</option>
                    <option value="Operasional Dapur Santri">Operasional Dapur Santri</option>
                    <option value="Wakaf Pembangunan Gedung & Sarana">Wakaf Pembangunan Gedung & Sarana</option>
                    <option value="Infaq & Sedekah Wali/Donatur">Infaq & Sedekah Wali/Donatur</option>
                    <option value="Bisyarah / Honor Asatidz">Bisyarah / Honor Asatidz</option>
                    <option value="Sarana, Prasarana & Perbaikan">Sarana, Prasarana & Perbaikan</option>
                    <option value="Listrik, Air & Internet Pondok">Listrik, Air & Internet Pondok</option>
                    <option value="Usaha & Unit Koperasi Pesantren">Usaha Koperasi Pesantren</option>
                    <option value="Kesehatan & Pengobatan Santri">Kesehatan Santri</option>
                    <option value="Administrasi & Kesekretariatan">Administrasi & Kesekretariatan</option>
                    <option value="Pengadaan Aset Tetap">Pengadaan Aset Tetap</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Divisi Pengaju / Penanggung Jawab
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as TeamDivision)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {divisions.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          ) : (
            /* MODE LENGKAP PERSAMAAN AKUNTANSI ROSETTA MATRIX */
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-indigo-950">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-700" />
                  <span className="font-semibold text-[11px]">
                    Persamaan: Aset (Rp {sumAssets.toLocaleString('id-ID')}) = Kewajiban + Ekuitas (Rp {(sumLiabilities + sumEquity).toLocaleString('id-ID')})
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isMatrixBalanced ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                }`}>
                  {isMatrixBalanced ? 'SEIMBANG' : 'BELUM SEIMBANG'}
                </span>
              </div>

              {/* 1. Akun Asset / Aktiva */}
              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <span className="font-black text-emerald-800 block text-[11px] uppercase tracking-wider">
                  1. Akun Asset / Aktiva
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Cash</label>
                    <input type="number" placeholder="0" value={matrixData.cash} onChange={(e) => handleMatrixChange('cash', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">AR (Piutang)</label>
                    <input type="number" placeholder="0" value={matrixData.ar} onChange={(e) => handleMatrixChange('ar', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">Inventory</label>
                    <input type="number" placeholder="0" value={matrixData.inventory} onChange={(e) => handleMatrixChange('inventory', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">PPE (Aset Tetap)</label>
                    <input type="number" placeholder="0" value={matrixData.ppe} onChange={(e) => handleMatrixChange('ppe', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">PrePaid</label>
                    <input type="number" placeholder="0" value={matrixData.prepaid} onChange={(e) => handleMatrixChange('prepaid', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600">GodWill</label>
                    <input type="number" placeholder="0" value={matrixData.godwill} onChange={(e) => handleMatrixChange('godwill', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                  </div>
                </div>
              </div>

              {/* 2 & 3. Akun Liabilities & Equity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
                  <span className="font-black text-rose-800 block text-[11px] uppercase tracking-wider">
                    2. Akun Kewajiban (Liabilities)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">AP (Utang)</label>
                      <input type="number" placeholder="0" value={matrixData.ap} onChange={(e) => handleMatrixChange('ap', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">TP (Pajak)</label>
                      <input type="number" placeholder="0" value={matrixData.tp} onChange={(e) => handleMatrixChange('tp', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">NP (Wesel)</label>
                      <input type="number" placeholder="0" value={matrixData.np} onChange={(e) => handleMatrixChange('np', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                  <span className="font-black text-indigo-800 block text-[11px] uppercase tracking-wider">
                    3. Akun Ekuitas (Equity)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Origin (Modal)</label>
                      <input type="number" placeholder="0" value={matrixData.origin} onChange={(e) => handleMatrixChange('origin', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Retained</label>
                      <input type="number" placeholder="0" value={matrixData.retained} onChange={(e) => handleMatrixChange('retained', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600">Earning</label>
                      <input type="number" placeholder="0" value={matrixData.earning} onChange={(e) => handleMatrixChange('earning', e.target.value)} className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Notification Checkbox */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-slate-700 font-semibold">
                Kirim notifikasi otomatis ke pengurus via WhatsApp saat tersimpan
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? '⏳ Menyimpan ke Google Sheets...' : 'Simpan Transaksi'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
