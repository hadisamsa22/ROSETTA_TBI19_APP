export interface AccountingMatrix {
  cash: number;
  ar: number;
  inventory: number;
  ppe: number;
  prepaid: number;
  godwill: number;
  ap: number;
  tp: number;
  np: number;
  origin: number;
  retained: number;
  earning: number;
}

export interface AccountingSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
  difference: number;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'asset' | 'liability';

export type TeamDivision = string;

export type TransactionCategory = 
  | 'Syahriah / SPP Santri'
  | 'Infaq & Sedekah Wali/Donatur'
  | 'Wakaf Pembangunan Gedung & Sarana'
  | 'Usaha & Unit Koperasi Pesantren'
  | 'Bantuan / Dana Hibah'
  | 'Operasional Dapur Santri'
  | 'Bisyarah / Honor Asatidz'
  | 'Sarana, Prasarana & Perbaikan'
  | 'Listrik, Air & Internet Pondok'
  | 'Kesehatan & Pengobatan Santri'
  | 'Administrasi & Kesekretariatan'
  | 'Pengadaan Aset Tetap'
  | 'Lainnya';

export interface AccountingTransaction extends AccountingMatrix {
  rowNum: number;
  id: string;
  date: string;
  event: string;
  category?: TransactionCategory | string;
  division?: TeamDivision;
  type?: TransactionType;
  amount?: number;
  recordedBy: string;
  approvalStatus: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  bankAccountRef?: string;
  notes?: string;
  createdAt?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  isActive: boolean;
  lastSynced: string;
  type: 'syariah' | 'cash';
}

export interface BankMutation {
  id: string;
  bankAccountId: string;
  bankName: string;
  date: string;
  time: string;
  type: 'CR' | 'DB';
  amount: number;
  description: string;
  referenceNumber: string;
  senderOrRecipient: string;
  isReconciled: boolean;
  matchedTransactionId?: string;
}

export type RoleKey = 'keuangan' | 'ketua_yayasan' | 'divisi' | 'auditor';

export interface TeamMember {
  id: string;
  name: string;
  role: RoleKey;
  roleTitle: string;
  avatarText: string;
  phone: string;
  divisionName?: string;
}

export interface InstitutionProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
}

export interface TransactionNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'income' | 'expense' | 'bank_sync' | 'alert';
  amount?: number;
  isRead: boolean;
  linkAction?: string;
}
