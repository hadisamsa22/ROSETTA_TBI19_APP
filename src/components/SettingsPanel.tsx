import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  Building, 
  CreditCard, 
  Database, 
  Trash2, 
  Plus, 
  Edit2, 
  Save, 
  Check, 
  AlertTriangle, 
  Phone, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink,
  Copy,
  Info
} from 'lucide-react';
import { 
  TeamMember, 
  RoleKey, 
  BankAccount, 
  InstitutionProfile 
} from '../types/accounting';
import { PonpesLogo } from './PonpesLogo';
import { formatRupiah } from '../utils/formatters';
import { APPS_SCRIPT_SAMPLE_CODE } from '../data/initialData';

interface SettingsPanelProps {
  teamMembers: TeamMember[];
  onSaveTeamMembers: (members: TeamMember[]) => void;
  divisions: string[];
  onSaveDivisions: (divisions: string[]) => void;
  institutionProfile: InstitutionProfile;
  onSaveInstitutionProfile: (profile: InstitutionProfile) => void;
  bankAccounts: BankAccount[];
  onSaveBankAccounts: (accounts: BankAccount[]) => void;
  googleSheetsUrl: string;
  onSaveGoogleSheetsUrl: (url: string) => void;
  onTestGoogleSheets: () => Promise<boolean>;
  isSheetsOnline: boolean;
  onClearAllTransactions: () => void;
  transactionCount: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  teamMembers,
  onSaveTeamMembers,
  divisions,
  onSaveDivisions,
  institutionProfile,
  onSaveInstitutionProfile,
  bankAccounts,
  onSaveBankAccounts,
  googleSheetsUrl,
  onSaveGoogleSheetsUrl,
  onTestGoogleSheets,
  isSheetsOnline,
  onClearAllTransactions,
  transactionCount,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'divisions' | 'institution' | 'banks' | 'sheets' | 'data'>('users');

  // USER MANAGEMENT STATE
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<RoleKey>('divisi');
  const [userDivision, setUserDivision] = useState(divisions[0] || 'Dapur & Konsumsi Santri');
  const [userPhone, setUserPhone] = useState('');

  // DIVISION MANAGEMENT STATE
  const [newDivisionName, setNewDivisionName] = useState('');

  // INSTITUTION PROFILE STATE
  const [profileData, setProfileData] = useState<InstitutionProfile>(institutionProfile);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // BANK ACCOUNTS STATE
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankBalanceInput, setBankBalanceInput] = useState<string>('');
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccNumber, setNewBankAccNumber] = useState('');
  const [newBankHolder, setNewBankHolder] = useState('');
  const [newBankBalance, setNewBankBalance] = useState('');

  // SHEETS STATE
  const [inputSheetsUrl, setInputSheetsUrl] = useState(googleSheetsUrl);
  const [isTestingSheets, setIsTestingSheets] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // RESET MODAL CONFIRMATION
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // USER CRUD
  const handleStartAddUser = () => {
    setUserName('');
    setUserRole('divisi');
    setUserDivision(divisions[0] || '');
    setUserPhone('08');
    setIsAddingUser(true);
    setEditingUserId(null);
  };

  const handleStartEditUser = (u: TeamMember) => {
    setUserName(u.name);
    setUserRole(u.role);
    setUserDivision(u.divisionName || divisions[0] || '');
    setUserPhone(u.phone);
    setEditingUserId(u.id);
    setIsAddingUser(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const roleTitles: Record<RoleKey, string> = {
      keuangan: 'Bagian Keuangan / Bendahara',
      ketua_yayasan: 'Ketua Yayasan',
      divisi: `Divisi ${userDivision || 'Operasional'}`,
      auditor: 'Tim Audit Keuangan',
    };

    const getInitials = (str: string) => {
      const parts = str.replace(/Ust\.|Dr\.|H\.|Hj\./g, '').trim().split(' ');
      return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'US';
    };

    if (editingUserId) {
      const updated = teamMembers.map((m) => {
        if (m.id === editingUserId) {
          return {
            ...m,
            name: userName.trim(),
            role: userRole,
            roleTitle: roleTitles[userRole],
            phone: userPhone.trim(),
            divisionName: userRole === 'divisi' ? userDivision : undefined,
            avatarText: getInitials(userName),
          };
        }
        return m;
      });
      onSaveTeamMembers(updated);
    } else {
      const newUser: TeamMember = {
        id: `user-${Date.now()}`,
        name: userName.trim(),
        role: userRole,
        roleTitle: roleTitles[userRole],
        phone: userPhone.trim() || '081234567890',
        divisionName: userRole === 'divisi' ? userDivision : undefined,
        avatarText: getInitials(userName),
      };
      onSaveTeamMembers([...teamMembers, newUser]);
    }

    setIsAddingUser(false);
    setEditingUserId(null);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (teamMembers.length <= 1) {
      alert('Minimal harus ada satu pengurus sistem!');
      return;
    }
    if (confirm(`Hapus pengguna "${name}" dari sistem?`)) {
      onSaveTeamMembers(teamMembers.filter(m => m.id !== id));
    }
  };

  // DIVISION CRUD
  const handleAddDivision = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDivisionName.trim();
    if (!trimmed) return;
    if (divisions.includes(trimmed)) {
      alert('Nama divisi sudah ada!');
      return;
    }
    onSaveDivisions([...divisions, trimmed]);
    setNewDivisionName('');
  };

  const handleDeleteDivision = (div: string) => {
    if (divisions.length <= 1) {
      alert('Minimal harus ada 1 divisi terdaftar!');
      return;
    }
    if (confirm(`Hapus divisi "${div}"?`)) {
      onSaveDivisions(divisions.filter(d => d !== div));
    }
  };

  // PROFILE SAVE
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInstitutionProfile(profileData);
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 2500);
  };

  // BANK UPDATE SALDO
  const handleSaveBankBalance = (bankId: string) => {
    const val = parseFloat(bankBalanceInput.replace(/[^0-9]/g, '')) || 0;
    const updated = bankAccounts.map(b => {
      if (b.id === bankId) {
        return { ...b, balance: val, lastSynced: new Date().toISOString() };
      }
      return b;
    });
    onSaveBankAccounts(updated);
    setEditingBankId(null);
  };

  const handleAddNewBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newBankAccNumber.trim()) return;

    const newBank: BankAccount = {
      id: `bank-${Date.now()}`,
      name: newBankName.trim(),
      bankName: newBankName.trim(),
      accountNumber: newBankAccNumber.trim(),
      accountHolder: newBankHolder.trim() || 'PESANTREN SAINS TEBUIRENG 19',
      balance: parseFloat(newBankBalance.replace(/[^0-9]/g, '')) || 0,
      isActive: true,
      lastSynced: new Date().toISOString(),
      type: 'syariah',
    };

    onSaveBankAccounts([...bankAccounts, newBank]);
    setIsAddingBank(false);
    setNewBankName('');
    setNewBankAccNumber('');
    setNewBankHolder('');
    setNewBankBalance('');
  };

  const handleDeleteBank = (id: string, name: string) => {
    if (bankAccounts.length <= 1) {
      alert('Minimal harus ada 1 rekening kas!');
      return;
    }
    if (confirm(`Hapus rekening "${name}"?`)) {
      onSaveBankAccounts(bankAccounts.filter(b => b.id !== id));
    }
  };

  // SHEETS TEST
  const handleTestSheets = async () => {
    setIsTestingSheets(true);
    setTestResult(null);
    onSaveGoogleSheetsUrl(inputSheetsUrl);
    const ok = await onTestGoogleSheets();
    setIsTestingSheets(false);
    setTestResult(ok);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_SAMPLE_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Settings Top Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PonpesLogo size="md" />
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
              Pengaturan & Konfigurasi Sistem
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pesantren Sains Tebuireng 19 Lombok · Kelola Pengguna, Divisi, Akun Bank & Database
            </p>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'users'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Pengguna & Pengurus ({teamMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('divisions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'divisions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Divisi Pondok ({divisions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('institution')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'institution'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4 text-amber-400" />
            <span>Profil Lembaga</span>
          </button>

          <button
            onClick={() => setActiveSubTab('banks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'banks'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4 text-teal-400" />
            <span>Rekening Bank & Kas ({bankAccounts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sheets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'sheets'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Koneksi Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveSubTab('data')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'data'
                ? 'bg-rose-950 text-rose-200 border border-rose-800'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan Data Buku</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: KELOLA PENGGUNA & PENGURUS */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Daftar Pengguna & Pengurus Sistem
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mengatur hak akses dan peran (Keuangan, Ketua Yayasan, Tim Audit, dan Divisi Pondok)
              </p>
            </div>
            <button
              onClick={handleStartAddUser}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Pengguna Baru</span>
            </button>
          </div>

          {/* Form Tambah/Edit Pengguna */}
          {isAddingUser && (
            <form onSubmit={handleSaveUser} className="p-4 rounded-xl bg-slate-50 border border-emerald-300 space-y-4 text-xs animate-in fade-in">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-black text-slate-800 text-sm">
                  {editingUserId ? 'Edit Data Pengguna' : 'Tambah Pengguna / Pengurus Baru'}
                </span>
                <button
                  type="button"
                  onClick={() => { setIsAddingUser(false); setEditingUserId(null); }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕ Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Pengurus</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Contoh: Ust. Firman / Ust. Abdullah"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peran / Jabatan</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as RoleKey)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="keuangan">1. Bagian Keuangan / Bendahara</option>
                    <option value="ketua_yayasan">2. Ketua Yayasan</option>
                    <option value="divisi">3. Divisi Operasional Pondok</option>
                    <option value="auditor">4. Tim Audit Keuangan</option>
                  </select>
                </div>

                {userRole === 'divisi' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Pilih Divisi Afiliasi</label>
                    <select
                      value={userDivision}
                      onChange={(e) => setUserDivision(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold"
                    >
                      {divisions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. WhatsApp Notifikasi</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="081917654321"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => { setIsAddingUser(false); setEditingUserId(null); }}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingUserId ? 'Simpan Perubahan' : 'Tambahkan Pengguna'}
                </button>
              </div>
            </form>
          )}

          {/* Tabel Pengguna */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                  <th className="p-3">PENGURUS</th>
                  <th className="p-3">PERAN SISTEM</th>
                  <th className="p-3">DIVISI / AFILIASI</th>
                  <th className="p-3">NO. WHATSAPP</th>
                  <th className="p-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {m.avatarText}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{m.name}</p>
                          <p className="text-[10px] text-slate-400">{m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                        m.role === 'keuangan' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.role === 'ketua_yayasan'
                          ? 'bg-amber-100 text-amber-900'
                          : m.role === 'auditor'
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {m.roleTitle}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">
                      {m.divisionName || (m.role === 'keuangan' ? 'Pusat Keuangan' : m.role === 'ketua_yayasan' ? 'Pimpinan Yayasan' : 'Audit Internal')}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {m.phone || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStartEditUser(m)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(m.id, m.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KELOLA DIVISI PONDOK */}
      {activeSubTab === 'divisions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Pengaturan Divisi Operasional Pondok
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Divisi digunakan untuk mencatat dan memantau pengeluaran tim secara transparan
            </p>
          </div>

          {/* Form Tambah Divisi */}
          <form onSubmit={handleAddDivision} className="flex gap-2 max-w-md">
            <input
              type="text"
              required
              value={newDivisionName}
              onChange={(e) => setNewDivisionName(e.target.value)}
              placeholder="Contoh: Divisi Robotika & Sains / Asrama Putri"
              className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
            >
              + Tambah Divisi
            </button>
          </form>

          {/* List Divisi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {divisions.map((div) => (
              <div
                key={div}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between hover:bg-white transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-800 text-xs">{div}</span>
                </div>
                <button
                  onClick={() => handleDeleteDivision(div)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Hapus Divisi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PROFIL LEMBAGA */}
      {activeSubTab === 'institution' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Profil Lembaga & Identitas Pondok
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data ini digunakan pada kop kuitansi kas masuk/keluar dan laporan keuangan resmi
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl text-xs">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 text-white">
              <PonpesLogo size="lg" />
              <div>
                <h4 className="font-black text-sm text-white">Logo Resmi Pesantren Sains Tebuireng 19 Lombok</h4>
                <p className="text-[11px] text-amber-400 font-medium mt-0.5">
                  Lambang segitiga emas resmi Khairul Wadi dengan bintang & sayap emas terpasang
                </p>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Lembaga</label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tagline / Keterangan Cabang</label>
              <input
                type="text"
                value={profileData.tagline}
                onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor Telepon / WhatsApp Resmi</label>
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil</span>
              </button>
              {profileSavedMsg && (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <Check className="w-4 h-4" /> Tersimpan!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: REKENING BANK & SALDO AWAL */}
      {activeSubTab === 'banks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Rekening Bank & Saldo Awal Kas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur saldo awal riil sebelum memulai pencatatan transaksi buku baru
              </p>
            </div>
            <button
              onClick={() => setIsAddingBank(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Rekening Bank</span>
            </button>
          </div>

          {/* Form Tambah Bank */}
          {isAddingBank && (
            <form onSubmit={handleAddNewBank} className="p-4 rounded-xl bg-slate-50 border border-emerald-300 space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold text-slate-800">Tambah Akun Rekening Bank Baru</span>
                <button type="button" onClick={() => setIsAddingBank(false)} className="text-slate-400">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Bank</label>
                  <input
                    type="text"
                    required
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="BSI / Bank NTB / BRI"
                    className="w-full p-2 bg-white border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Rekening</label>
                  <input
                    type="text"
                    required
                    value={newBankAccNumber}
                    onChange={(e) => setNewBankAccNumber(e.target.value)}
                    placeholder="7192839101"
                    className="w-full p-2 bg-white border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    value={newBankHolder}
                    onChange={(e) => setNewBankHolder(e.target.value)}
                    placeholder="YAYASAN KHAIRUL WADI"
                    className="w-full p-2 bg-white border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Saldo Awal (Rp)</label>
                  <input
                    type="number"
                    value={newBankBalance}
                    onChange={(e) => setNewBankBalance(e.target.value)}
                    placeholder="0"
                    className="w-full p-2 bg-white border rounded-lg font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setIsAddingBank(false)} className="px-3 py-1.5 border rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg">Simpan Bank</button>
              </div>
            </form>
          )}

          {/* List Rekening Bank dengan Ubah Saldo */}
          <div className="space-y-3">
            {bankAccounts.map((b) => (
              <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{b.name}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {b.bankName}
                    </span>
                  </div>
                  <p className="text-slate-500 font-mono mt-0.5">
                    No. Rekening: {b.accountNumber} · a.n. {b.accountHolder}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {editingBankId === b.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={bankBalanceInput}
                        onChange={(e) => setBankBalanceInput(e.target.value)}
                        placeholder="Saldo Baru"
                        className="p-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs w-36"
                      />
                      <button
                        onClick={() => handleSaveBankBalance(b.id)}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingBankId(null)}
                        className="p-1.5 text-slate-400"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Saldo Terkini</span>
                      <span className="text-base font-black font-mono text-slate-900">
                        {formatRupiah(b.balance)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 border-l pl-3">
                    <button
                      onClick={() => {
                        setEditingBankId(b.id);
                        setBankBalanceInput(String(b.balance));
                      }}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                      title="Ubah Saldo Riil"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBank(b.id, b.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Hapus Rekening"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: GOOGLE SHEETS */}
      {activeSubTab === 'sheets' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6 text-xs">
          <div className="border-b pb-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              Integrasi Basis Data Google Sheets
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap transaksi otomatis dicatat ke baris Google Spreadsheet menggunakan Google Apps Script
            </p>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isSheetsOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isSheetsOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <p className="font-bold">
                  Status: {isSheetsOnline ? 'Terhubung dengan Google Apps Script' : 'Mode Offline / Local Synchronized Cache'}
                </p>
                <p className="text-[11px] opacity-80">
                  {isSheetsOnline 
                    ? 'Data langsung dibaca dan ditulis ke baris Google Spreadsheet.' 
                    : 'Aplikasi tetap bekerja 100% menggunakan penyimpanan lokal berkecepatan tinggi.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleTestSheets}
              disabled={isTestingSheets}
              className="px-3 py-1.5 rounded-lg bg-white border border-current font-bold text-xs flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingSheets ? 'animate-spin' : ''}`} />
              <span>{isTestingSheets ? 'Mengecek...' : 'Uji Koneksi'}</span>
            </button>
          </div>

          {testResult !== null && (
            <div className={`p-3 rounded-xl font-semibold flex items-center gap-2 ${
              testResult ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {testResult ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Koneksi Google Sheets berhasil aktif!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Tidak dapat mencapai URL (CORS/Timeout). Pastikan Deploy sebagai "Anyone".</span>
                </>
              )}
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              URL Web App Google Apps Script
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputSheetsUrl}
                onChange={(e) => setInputSheetsUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white"
              />
              <button
                type="button"
                onClick={() => onSaveGoogleSheetsUrl(inputSheetsUrl)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl"
              >
                Simpan URL
              </button>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Kode Google Apps Script (Code.gs)</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl max-h-40 overflow-y-auto border border-slate-800">
              {APPS_SCRIPT_SAMPLE_CODE}
            </pre>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: BERSIHKAN DATA & RESET BUKU */}
      {activeSubTab === 'data' && (
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-5 sm:p-6 space-y-6 text-xs">
          <div className="border-b border-rose-100 pb-4">
            <h3 className="font-extrabold text-rose-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Manajemen Data Transaksi & Buku Baru</span>
            </h3>
            <p className="text-xs text-rose-600 mt-0.5">
              Fitur untuk membersihkan data uji coba / dummy dan memulai pembukuan riil yang bersih
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Status Data Transaksi Saat Ini:</h4>
                <p className="mt-1">
                  Saat ini terdapat <strong>{transactionCount} transaksi</strong> di buku kas.
                </p>
                <p className="mt-1 text-[11px] text-rose-700">
                  Jika Anda menekan tombol di bawah, semua riwayat transaksi akan dihapus dan tabel kembali kosong (bersih) sehingga Anda dapat menginput transaksi riil Pesantren Sains Tebuireng 19 Lombok dari awal.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-rose-200 flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Bersihkan Semua Data Transaksi Sekarang</span>
              </button>
            </div>
          </div>

          {/* Confirm Modal */}
          {confirmClearOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-300 space-y-4">
                <div className="flex items-center gap-3 text-rose-600">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="font-black text-base text-slate-900">Konfirmasi Pembersihan Data</h3>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Apakah Anda yakin ingin menghapus seluruh {transactionCount} data transaksi pembukuan? Tindakan ini akan mengosongkan tabel transaksi untuk pembukuan riil baru.
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setConfirmClearOpen(false)}
                    className="px-3.5 py-2 border rounded-xl font-semibold text-slate-600"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      onClearAllTransactions();
                      setConfirmClearOpen(false);
                      alert('Data transaksi berhasil dibersihkan! Pembukuan siap digunakan dari awal.');
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md"
                  >
                    Ya, Bersihkan Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
