import { 
  AccountingTransaction, 
  BankAccount, 
  BankMutation, 
  TeamMember,
  InstitutionProfile 
} from '../types/accounting';

export const DEFAULT_INSTITUTION_PROFILE: InstitutionProfile = {
  name: 'Pesantren Sains Tebuireng 19 Lombok',
  tagline: 'Khairul Wadi · Sistem Keuangan & Persamaan Akuntansi Terpadu',
  address: 'Kecamatan Labuapi, Kabupaten Lombok Barat, Nusa Tenggara Barat',
  phone: '081917654321',
  email: 'tebuireng19lombok@gmail.com',
};

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bsi-operasional',
    name: 'BSI Rekening Utama Pesantren',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '7192839101',
    accountHolder: 'YAYASAN KHAIRUL WADI TEBUIRENG 19',
    balance: 0,
    isActive: true,
    lastSynced: new Date().toISOString(),
    type: 'syariah',
  },
  {
    id: 'ntb-syariah',
    name: 'Bank NTB Syariah Wakaf & Pembangunan',
    bankName: 'Bank NTB Syariah',
    accountNumber: '5029182301',
    accountHolder: 'PESANTREN SAINS TEBUIRENG 19 LOMBOK',
    balance: 0,
    isActive: true,
    lastSynced: new Date().toISOString(),
    type: 'syariah',
  },
  {
    id: 'kas-brankas',
    name: 'Kas Tunai / Brankas Keuangan',
    bankName: 'Kas Tunai Pesantren',
    accountNumber: 'CASH-01',
    accountHolder: 'BAGIAN KEUANGAN TEBUIRENG 19',
    balance: 0,
    isActive: true,
    lastSynced: new Date().toISOString(),
    type: 'cash',
  },
];

// REVISI v.1.1: Data Transaksi Kosong (Siap digunakan langsung untuk pencatatan riil)
export const INITIAL_TRANSACTIONS: AccountingTransaction[] = [];

// REVISI v.1.1: Data Mutasi Bank Kosong (Siap sinkronisasi mutasi riil)
export const INITIAL_BANK_MUTATIONS: BankMutation[] = [];

// REVISI v.1.1: Pengurus Sesuai Permintaan User
// 1. Keuangan: Ust. Firman
// 2. Ketua Yayasan: Ust. Herman Zuhdi
// 3. Divisi: akan diisi di menu pengaturan Pengguna
// 4. Team Audit: Ust. Samsul Hadi
export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'user-keuangan',
    name: 'Ust. Firman',
    role: 'keuangan',
    roleTitle: 'Bagian Keuangan / Bendahara',
    avatarText: 'UF',
    phone: '081917654321',
  },
  {
    id: 'user-ketua-yayasan',
    name: 'Ust. Herman Zuhdi',
    role: 'ketua_yayasan',
    roleTitle: 'Ketua Yayasan',
    avatarText: 'HZ',
    phone: '081803234567',
  },
  {
    id: 'user-audit',
    name: 'Ust. Samsul Hadi',
    role: 'auditor',
    roleTitle: 'Tim Audit Keuangan',
    avatarText: 'SH',
    phone: '081237889900',
  },
];

export const INITIAL_DIVISIONS: string[] = [
  'Dapur & Konsumsi Santri',
  'Sarpras & Pembangunan',
  'Pendidikan & Asatidz',
  'Koperasi Pesantren',
  'Kesehatan Santri',
  'Kesekretariatan & IT',
  'Umum & Kebersihan',
];

export const GOOGLE_APPS_SCRIPT_DEFAULT_URL = 
  'https://script.google.com/macros/s/AKfycby6k_VyEagSR79c46sY_ma3hIU06RqROyD45DStvVkngqWhZ5zYEBtSBTbBcl-yG6w/exec';

export const APPS_SCRIPT_SAMPLE_CODE = `/**
 * Kode Google Apps Script (Code.gs)
 * Untuk Pesantren Sains Tebuireng 19 Lombok
 * Sistem Persamaan Dasar Akuntansi (Rosetta Matrix)
 * Deploy sebagai: Web App (Execute as: Me, Who has access: Anyone)
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var action = e.parameter.action;

  if (action === "getSummary") {
    return ContentService.createTextOutput(JSON.stringify(hitungSummary(sheet)))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getTransactions") {
    return ContentService.createTextOutput(JSON.stringify(ambilTransaksi(sheet)))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "OK", pesan: "Pesantren Sains Tebuireng 19 Lombok API Aktif" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    if (data.action === "addTransaction") {
      sheet.appendRow([
        data.date,
        data.event,
        Number(data.cash) || 0,
        Number(data.ar) || 0,
        Number(data.inventory) || 0,
        Number(data.ppe) || 0,
        Number(data.prepaid) || 0,
        Number(data.godwill) || 0,
        Number(data.ap) || 0,
        Number(data.tp) || 0,
        Number(data.np) || 0,
        Number(data.origin) || 0,
        Number(data.retained) || 0,
        Number(data.earning) || 0
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Transaksi Tersimpan" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === "deleteTransaction") {
      sheet.deleteRow(Number(data.rowNum));
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Transaksi Dihapus" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Aksi tidak dikenal" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
