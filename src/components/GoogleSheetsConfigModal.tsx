import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Download,
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { APPS_SCRIPT_SAMPLE_CODE, GOOGLE_APPS_SCRIPT_DEFAULT_URL } from '../data/initialData';

interface GoogleSheetsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onSaveApiUrl: (url: string) => void;
  onTestConnection: () => Promise<boolean>;
  isOnline: boolean;
  onExportCsv: () => void;
}

export const GoogleSheetsConfigModal: React.FC<GoogleSheetsConfigModalProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onSaveApiUrl,
  onTestConnection,
  isOnline,
  onExportCsv,
}) => {
  if (!isOpen) return null;

  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    onSaveApiUrl(inputUrl);
    const ok = await onTestConnection();
    setIsTesting(false);
    setTestResult(ok ? 'success' : 'fail');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SAMPLE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetDefault = () => {
    setInputUrl(GOOGLE_APPS_SCRIPT_DEFAULT_URL);
    onSaveApiUrl(GOOGLE_APPS_SCRIPT_DEFAULT_URL);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Integrasi Basis Data Google Sheets
              </h3>
              <p className="text-[11px] text-emerald-400 font-medium">
                Pondok Pesantren Tebuireng 19 Lombok
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

        {/* Content Body */}
        <div className="p-5 space-y-5 text-xs overflow-y-auto flex-1">
          
          {/* Connection Status Box */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <p className="font-bold">
                  Status: {isOnline ? 'Terhubung dengan Google Apps Script' : 'Mode Offline / Local Synchronized Cache'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isOnline 
                    ? 'Data langsung dibaca dan ditulis ke baris Google Spreadsheet.' 
                    : 'Aplikasi tetap bekerja 100% menggunakan penyimpanan lokal berkecepatan tinggi.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-lg bg-white border border-current font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Mengecek...' : 'Uji Koneksi'}</span>
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              testResult === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {testResult === 'success' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Koneksi berhasil! Google Apps Script merespons dengan benar.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Tidak dapat mencapai URL (CORS/Timeout). Pastikan Deploy sebagai "Anyone". Cache lokal tetap aktif.</span>
                </>
              )}
            </div>
          )}

          {/* Web App URL Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">
              URL Web App Google Apps Script (Exec Endpoint)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onSaveApiUrl(inputUrl)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
              >
                Simpan
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[11px] text-slate-500 hover:text-emerald-700 underline"
              >
                Kembalikan ke URL Default
              </button>
              <button
                type="button"
                onClick={onExportCsv}
                className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Unduh Data ke CSV</span>
              </button>
            </div>
          </div>

          {/* Step by step guide */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Panduan Menghubungkan Google Spreadsheet Sendiri:</span>
            </h4>

            <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
              <li>Buka <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-0.5">Google Sheets <ExternalLink className="w-3 h-3 inline" /></a> dan buat spreadsheet baru.</li>
              <li>Buka menu <strong>Ekstensi &gt; Apps Script</strong> pada Google Sheets Anda.</li>
              <li>Hapus isi default, lalu salin dan tempel kode <strong className="font-mono">Code.gs</strong> di bawah.</li>
              <li>Klik <strong>Deploy &gt; New Deployment</strong>, pilih jenis <strong>Web App</strong>.</li>
              <li>Atur <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>, lalu klik <strong>Deploy</strong>.</li>
              <li>Salin URL Web App yang berakhiran <code className="bg-slate-200 px-1 rounded">/exec</code> ke kolom di atas.</li>
            </ol>
          </div>

          {/* Apps Script Code Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Kode Google Apps Script (Code.gs)</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl max-h-40 overflow-y-auto leading-relaxed border border-slate-800">
              {APPS_SCRIPT_SAMPLE_CODE}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition text-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
