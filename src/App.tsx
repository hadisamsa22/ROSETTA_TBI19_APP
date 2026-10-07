/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardSummary } from './components/DashboardSummary';
import { AccountingMatrixTable } from './components/AccountingMatrixTable';
import { BankSyncPanel } from './components/BankSyncPanel';
import { TeamTransparencyPanel } from './components/TeamTransparencyPanel';
import { FinancialReportsView } from './components/FinancialReportsView';
import { SettingsPanel } from './components/SettingsPanel';
import { TransactionModal } from './components/TransactionModal';
import { GoogleSheetsConfigModal } from './components/GoogleSheetsConfigModal';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { NotificationPopover } from './components/NotificationPopover';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { 
  AccountingTransaction, 
  BankAccount, 
  BankMutation, 
  TeamMember,
  InstitutionProfile
} from './types/accounting';
import { 
  googleSheetsService, 
  calculateSummary 
} from './services/googleSheetsService';
import { bankService } from './services/bankService';
import { 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_DIVISIONS, 
  DEFAULT_INSTITUTION_PROFILE 
} from './data/initialData';
import { formatRupiah, generateWhatsAppMessageUrl } from './utils/formatters';

const STORAGE_MEMBERS_KEY = 'tebuireng19_team_members_v2';
const STORAGE_DIVISIONS_KEY = 'tebuireng19_divisions_v2';
const STORAGE_PROFILE_KEY = 'tebuireng19_profile_v2';

function MainApp() {
  const { addNotification } = useNotifications();

  // Navigation state (Includes new 'settings' tab)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'matrix' | 'bank' | 'team' | 'reports' | 'settings'>('dashboard');

  // Multi-user & Division dynamic state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    if (typeof window === 'undefined') return INITIAL_TEAM_MEMBERS;
    const saved = localStorage.getItem(STORAGE_MEMBERS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_TEAM_MEMBERS;
  });

  const [divisions, setDivisions] = useState<string[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DIVISIONS;
    const saved = localStorage.getItem(STORAGE_DIVISIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_DIVISIONS;
  });

  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile>(() => {
    if (typeof window === 'undefined') return DEFAULT_INSTITUTION_PROFILE;
    const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_INSTITUTION_PROFILE;
  });

  // Current active user for operations
  const [currentMember, setCurrentMember] = useState<TeamMember>(() => teamMembers[0] || INITIAL_TEAM_MEMBERS[0]);

  // Save team members, divisions & profile
  const handleSaveTeamMembers = (members: TeamMember[]) => {
    setTeamMembers(members);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_MEMBERS_KEY, JSON.stringify(members));
    }
    // Update current member if still exists or fallback to first
    const found = members.find((m) => m.id === currentMember.id);
    if (found) {
      setCurrentMember(found);
    } else if (members[0]) {
      setCurrentMember(members[0]);
    }
  };

  const handleSaveDivisions = (newDivs: string[]) => {
    setDivisions(newDivs);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DIVISIONS_KEY, JSON.stringify(newDivs));
    }
  };

  const handleSaveInstitutionProfile = (prof: InstitutionProfile) => {
    setInstitutionProfile(prof);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(prof));
    }
  };

  // Data states (Clean slate initialized with empty array)
  const [transactions, setTransactions] = useState<AccountingTransaction[]>(() => 
    googleSheetsService.getLocalTransactions()
  );
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => 
    bankService.getAccounts()
  );
  const [mutations, setMutations] = useState<BankMutation[]>(() => 
    bankService.getMutations()
  );

  // Sync states
  const [isOnlineWithSheets, setIsOnlineWithSheets] = useState<boolean>(true);
  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [isSyncingBank, setIsSyncingBank] = useState<boolean>(false);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [printingTransaction, setPrintingTransaction] = useState<AccountingTransaction | null>(null);

  // Calculate live summary from transactions
  const { summary, assets, liabilities, equity } = useMemo(() => {
    return calculateSummary(transactions);
  }, [transactions]);

  // Initial load from Google Sheets
  const refreshFromGoogleSheets = useCallback(async () => {
    setIsSyncingSheets(true);
    try {
      const result = await googleSheetsService.fetchTransactionsFromSheet();
      setTransactions(result.data);
      setIsOnlineWithSheets(result.isOnline);
    } catch (e) {
      console.warn('Refresh error:', e);
      setIsOnlineWithSheets(false);
    } finally {
      setIsSyncingSheets(false);
    }
  }, []);

  useEffect(() => {
    refreshFromGoogleSheets();
  }, [refreshFromGoogleSheets]);

  // Handle New Transaction
  const handleCreateTransaction = async (txData: Omit<AccountingTransaction, 'rowNum' | 'id'>) => {
    const res = await googleSheetsService.addTransaction(txData);
    setTransactions(googleSheetsService.getLocalTransactions());

    // Update bank account balance if tied
    if (txData.cash !== 0) {
      const targetBank = bankAccounts.find((b) => b.id === txData.bankAccountRef) || bankAccounts[0];
      const updatedAccounts = bankAccounts.map((b) => {
        if (b.id === targetBank.id) {
          return {
            ...b,
            balance: b.balance + txData.cash,
            lastSynced: new Date().toISOString(),
          };
        }
        return b;
      });
      setBankAccounts(updatedAccounts);
      bankService.saveAccounts(updatedAccounts);
    }

    // Trigger automatic notification
    const isIncome = txData.cash > 0;
    const nominal = Math.abs(txData.cash || txData.amount || 0);

    addNotification({
      title: isIncome ? 'Penerimaan Kas Berhasil Dicatat' : 'Pengeluaran Tim Berhasil Dicatat',
      message: `${txData.event} sebesar ${formatRupiah(nominal)} (${txData.division || 'Umum'})`,
      type: isIncome ? 'income' : 'expense',
      amount: nominal,
    });
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string, rowNum: number, event: string) => {
    if (!window.confirm(`Hapus transaksi "${event}" dari pembukuan dan Google Sheets?`)) {
      return;
    }

    await googleSheetsService.deleteTransaction(id, rowNum);
    setTransactions(googleSheetsService.getLocalTransactions());

    addNotification({
      title: 'Transaksi Dihapus',
      message: `Transaksi "${event}" telah dihapus dari sistem dan Google Sheets.`,
      type: 'alert',
    });
  };

  // Handle Approval Update
  const handleUpdateApproval = (id: string, status: 'approved' | 'rejected') => {
    const updated = googleSheetsService.updateApproval(id, status, currentMember.name);
    setTransactions(updated);

    addNotification({
      title: status === 'approved' ? 'Pengeluaran Telah Disetujui' : 'Pengeluaran Ditolak',
      message: `Status transaksi telah diperbarui oleh ${currentMember.name}.`,
      type: 'alert',
    });
  };

  // Bank Feed Sync
  const handleSyncBankFeed = async () => {
    setIsSyncingBank(true);
    try {
      const res = await bankService.syncBankFeed();
      setBankAccounts(res.accounts);
      setMutations(res.mutations);

      addNotification({
        title: 'Sinkronisasi Rekening Bank Selesai',
        message: `Berhasil memeriksa mutasi terbaru dari BSI & Bank NTB Syariah.`,
        type: 'bank_sync',
      });
    } finally {
      setIsSyncingBank(false);
    }
  };

  // Simulate Incoming Real-time Transaction
  const handleSimulateIncomingTransaction = () => {
    const newMut = bankService.generateSimulatedIncomingTransaction();
    setMutations(bankService.getMutations());
    setBankAccounts(bankService.getAccounts());

    // Trigger instant notification with chime sound!
    addNotification({
      title: newMut.type === 'CR' ? '⚡ Mutasi Rekening Bank Masuk!' : '⚡ Mutasi Rekening Bank Keluar!',
      message: `${newMut.description} sebesar ${formatRupiah(newMut.amount)} (${newMut.bankName})`,
      type: newMut.type === 'CR' ? 'income' : 'expense',
      amount: newMut.amount,
    });
  };

  // Reconcile Mutation to Accounting Matrix
  const handleReconcileMutation = async (mut: BankMutation) => {
    const isIncome = mut.type === 'CR';
    const amount = mut.amount;

    let category = 'Operasional Dapur Santri';
    let division = divisions[0] || 'Dapur & Konsumsi Santri';

    if (isIncome) {
      if (mut.description.includes('SYAHRIAH') || mut.description.includes('SPP')) {
        category = 'Syahriah / SPP Santri';
        division = 'Pendidikan & Asatidz';
      } else if (mut.description.includes('WAKAF') || mut.description.includes('ASRAMA')) {
        category = 'Wakaf Pembangunan Gedung & Sarana';
        division = 'Sarpras & Pembangunan';
      } else {
        category = 'Infaq & Sedekah Wali/Donatur';
        division = 'Kesekretariatan & IT';
      }
    } else {
      if (mut.description.includes('LISTRIK') || mut.description.includes('PLN')) {
        category = 'Listrik, Air & Internet Pondok';
        division = 'Sarpras & Pembangunan';
      } else if (mut.description.includes('BUKU') || mut.description.includes('MODUL')) {
        category = 'Usaha & Unit Koperasi Pesantren';
        division = 'Koperasi Pesantren';
      }
    }

    const txPayload: Omit<AccountingTransaction, 'rowNum' | 'id'> = {
      date: mut.date,
      event: `[Bank ${mut.bankName}] ${mut.description}`,
      category: category as any,
      division: division as any,
      type: isIncome ? 'income' : 'expense',
      amount,
      recordedBy: currentMember.name,
      approvalStatus: 'approved',
      bankAccountRef: mut.bankAccountId,
      notes: `Terekonsiliasi dari mutasi bank Ref: ${mut.referenceNumber}`,
      cash: isIncome ? amount : -amount,
      ar: 0,
      inventory: 0,
      ppe: 0,
      prepaid: 0,
      godwill: 0,
      ap: 0,
      tp: 0,
      np: 0,
      origin: 0,
      retained: 0,
      earning: isIncome ? amount : -amount,
    };

    const res = await googleSheetsService.addTransaction(txPayload);
    setTransactions(googleSheetsService.getLocalTransactions());

    // Mark mutation as reconciled
    const updatedMutations = bankService.markReconciled(mut.id, res.transaction.id);
    setMutations(updatedMutations);

    addNotification({
      title: 'Mutasi Berhasil Dicatat ke Jurnal!',
      message: `Mutasi ${mut.referenceNumber} otomatis dikonversi ke Jurnal Rosetta Matrix & Google Sheets.`,
      type: isIncome ? 'income' : 'expense',
      amount,
    });
  };

  // Import Bank CSV
  const handleImportCsv = (csvText: string, bankAccountId: string) => {
    bankService.parseBankStatementCsv(csvText, bankAccountId);
    setMutations(bankService.getMutations());
    addNotification({
      title: 'Import Mutasi Selesai',
      message: 'Rekening koran berhasil diimpor. Silakan periksa daftar mutasi untuk pencatatan ke jurnal.',
      type: 'bank_sync',
    });
  };

  // Export CSV
  const handleExportCsv = () => {
    const csv = googleSheetsService.exportCsv(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Keuangan_Pesantren_Sains_Tebuireng_19_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Test Sheets Connection
  const handleTestSheetsConnection = async () => {
    try {
      const res = await googleSheetsService.fetchTransactionsFromSheet();
      setIsOnlineWithSheets(res.isOnline);
      if (res.isOnline) {
        setTransactions(res.data);
      }
      return res.isOnline;
    } catch {
      setIsOnlineWithSheets(false);
      return false;
    }
  };

  // Clear all transactions (Clean slate)
  const handleClearAllTransactions = () => {
    googleSheetsService.clearAllTransactions();
    setTransactions([]);
    bankService.clearAllMutations();
    setMutations([]);

    addNotification({
      title: 'Buku Kas Telah Dibersihkan',
      message: 'Seluruh riwayat transaksi telah dikosongkan. Buku kas siap untuk penggunaan riil dari awal.',
      type: 'alert',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col pb-20 lg:pb-8 selection:bg-amber-200">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
        onOpenSheetsConfig={() => setIsSheetsModalOpen(true)}
        isOnlineWithSheets={isOnlineWithSheets}
        isSyncing={isSyncingSheets}
        onManualSync={refreshFromGoogleSheets}
        currentMember={currentMember}
        onSelectMember={setCurrentMember}
        onOpenNotifications={() => setIsNotifOpen(true)}
        teamMembers={teamMembers}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardSummary
            summary={summary}
            assets={assets}
            liabilities={liabilities}
            equity={equity}
            bankAccounts={bankAccounts}
            recentTransactions={transactions}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
            onGoToMatrix={() => setActiveTab('matrix')}
            onGoToBank={() => setActiveTab('bank')}
            onTriggerBankSync={handleSyncBankFeed}
            isBankSyncing={isSyncingBank}
          />
        )}

        {activeTab === 'matrix' && (
          <AccountingMatrixTable
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
            onPrintReceipt={(t) => setPrintingTransaction(t)}
            onExportCsv={handleExportCsv}
            currentCashBalance={assets.cash}
            divisions={divisions}
          />
        )}

        {activeTab === 'bank' && (
          <BankSyncPanel
            bankAccounts={bankAccounts}
            mutations={mutations}
            onSyncBank={handleSyncBankFeed}
            isSyncing={isSyncingBank}
            onSimulateIncomingTransaction={handleSimulateIncomingTransaction}
            onReconcileMutation={handleReconcileMutation}
            onImportCsv={handleImportCsv}
          />
        )}

        {activeTab === 'team' && (
          <TeamTransparencyPanel
            transactions={transactions}
            currentMember={currentMember}
            onUpdateApproval={handleUpdateApproval}
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
            currentCashBalance={assets.cash}
            divisions={divisions}
            teamMembers={teamMembers}
          />
        )}

        {activeTab === 'reports' && (
          <FinancialReportsView
            summary={summary}
            assets={assets}
            liabilities={liabilities}
            equity={equity}
            transactions={transactions}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            teamMembers={teamMembers}
            onSaveTeamMembers={handleSaveTeamMembers}
            divisions={divisions}
            onSaveDivisions={handleSaveDivisions}
            institutionProfile={institutionProfile}
            onSaveInstitutionProfile={handleSaveInstitutionProfile}
            bankAccounts={bankAccounts}
            onSaveBankAccounts={(accs) => {
              setBankAccounts(accs);
              bankService.saveAccounts(accs);
            }}
            googleSheetsUrl={googleSheetsService.getStoredApiUrl()}
            onSaveGoogleSheetsUrl={(url) => googleSheetsService.setStoredApiUrl(url)}
            onTestGoogleSheets={handleTestSheetsConnection}
            isSheetsOnline={isOnlineWithSheets}
            onClearAllTransactions={handleClearAllTransactions}
            transactionCount={transactions.length}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => setIsTxModalOpen(true)}
      />

      {/* Modals & Overlays */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleCreateTransaction}
        bankAccounts={bankAccounts}
        currentMember={currentMember}
        divisions={divisions}
      />

      <GoogleSheetsConfigModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        apiUrl={googleSheetsService.getStoredApiUrl()}
        onSaveApiUrl={(url) => googleSheetsService.setStoredApiUrl(url)}
        onTestConnection={handleTestSheetsConnection}
        isOnline={isOnlineWithSheets}
        onExportCsv={handleExportCsv}
      />

      <ReceiptPrintModal
        transaction={printingTransaction}
        onClose={() => setPrintingTransaction(null)}
      />

      <NotificationPopover
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <MainApp />
    </NotificationProvider>
  );
}
