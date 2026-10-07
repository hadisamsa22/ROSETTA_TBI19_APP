import { AccountingMatrix, AccountingSummary, AccountingTransaction } from '../types/accounting';
import { GOOGLE_APPS_SCRIPT_DEFAULT_URL, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEY_TX = 'tebuireng19_transactions_v2';
const STORAGE_KEY_API_URL = 'tebuireng19_google_api_url_v2';
const STORAGE_KEY_SYNC_LOG = 'tebuireng19_sync_logs_v2';

export function calculateSummary(transactions: AccountingTransaction[]): {
  summary: AccountingSummary;
  assets: { cash: number; ar: number; inventory: number; ppe: number; prepaid: number; godwill: number };
  liabilities: { ap: number; tp: number; np: number };
  equity: { origin: number; retained: number; earning: number };
} {
  const assets = {
    cash: 0,
    ar: 0,
    inventory: 0,
    ppe: 0,
    prepaid: 0,
    godwill: 0,
  };

  const liabilities = {
    ap: 0,
    tp: 0,
    np: 0,
  };

  const equity = {
    origin: 0,
    retained: 0,
    earning: 0,
  };

  for (const t of transactions) {
    assets.cash += Number(t.cash) || 0;
    assets.ar += Number(t.ar) || 0;
    assets.inventory += Number(t.inventory) || 0;
    assets.ppe += Number(t.ppe) || 0;
    assets.prepaid += Number(t.prepaid) || 0;
    assets.godwill += Number(t.godwill) || 0;

    liabilities.ap += Number(t.ap) || 0;
    liabilities.tp += Number(t.tp) || 0;
    liabilities.np += Number(t.np) || 0;

    equity.origin += Number(t.origin) || 0;
    equity.retained += Number(t.retained) || 0;
    equity.earning += Number(t.earning) || 0;
  }

  const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
  const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0);
  const totalEquity = Object.values(equity).reduce((a, b) => a + b, 0);
  
  const rightSide = totalLiabilities + totalEquity;
  const difference = totalAssets - rightSide;
  const isBalanced = Math.abs(difference) < 1; // Tolerance for floating points

  return {
    summary: {
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced,
      difference,
    },
    assets,
    liabilities,
    equity,
  };
}

export class GoogleSheetsService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = this.getStoredApiUrl();
  }

  public getStoredApiUrl(): string {
    if (typeof window === 'undefined') return GOOGLE_APPS_SCRIPT_DEFAULT_URL;
    return localStorage.getItem(STORAGE_KEY_API_URL) || GOOGLE_APPS_SCRIPT_DEFAULT_URL;
  }

  public setStoredApiUrl(url: string) {
    this.apiUrl = url.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_API_URL, this.apiUrl);
    }
  }

  public getLocalTransactions(): AccountingTransaction[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY_TX);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public saveLocalTransactions(txs: AccountingTransaction[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(txs));
    }
  }

  public clearAllTransactions() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_TX);
      localStorage.removeItem('tebuireng19_transactions_v1');
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([]));
    }
  }

  /**
   * Fetch live transactions from Google Sheets API
   */
  public async fetchTransactionsFromSheet(): Promise<{
    data: AccountingTransaction[];
    isOnline: boolean;
    error?: string;
  }> {
    const local = this.getLocalTransactions();
    if (!this.apiUrl) {
      return { data: local, isOnline: false };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(`${this.apiUrl}?action=getTransactions`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const remoteData = await res.json();
      if (Array.isArray(remoteData) && remoteData.length > 0) {
        // Map fields safely
        const parsed: AccountingTransaction[] = remoteData.map((item: any, idx: number) => ({
          rowNum: Number(item.rowNum) || idx + 2,
          id: `tx-sheet-${item.rowNum || idx + 1}`,
          date: item.date || new Date().toISOString().split('T')[0],
          event: item.event || 'Transaksi',
          category: item.category || 'Operasional Dapur & Bahan Pokok',
          division: item.division || 'Dapur & Konsumsi',
          type: (Number(item.cash) >= 0 ? 'income' : 'expense') as any,
          amount: Math.abs(Number(item.cash) || Number(item.earning) || 0),
          recordedBy: item.recordedBy || 'Bendahara Ponpes',
          approvalStatus: 'approved',
          cash: Number(item.cash) || 0,
          ar: Number(item.ar) || 0,
          inventory: Number(item.inventory) || 0,
          ppe: Number(item.ppe) || 0,
          prepaid: Number(item.prepaid) || 0,
          godwill: Number(item.godwill) || 0,
          ap: Number(item.ap) || 0,
          tp: Number(item.tp) || 0,
          np: Number(item.np) || 0,
          origin: Number(item.origin) || 0,
          retained: Number(item.retained) || 0,
          earning: Number(item.earning) || 0,
        }));

        this.saveLocalTransactions(parsed);
        return { data: parsed, isOnline: true };
      }

      // If empty array from sheet, keep local
      return { data: local, isOnline: true };
    } catch (err: any) {
      console.warn('Google Sheets API unavailable or CORS/Timeout, using local synchronized cache:', err);
      return {
        data: local,
        isOnline: false,
        error: err.name === 'AbortError' ? 'Koneksi timeout (memakai cache lokal)' : 'Mode offline / Cache lokal aktif',
      };
    }
  }

  /**
   * Save transaction to both Google Sheets (POST) and local cache
   */
  public async addTransaction(
    tx: Omit<AccountingTransaction, 'rowNum' | 'id'>
  ): Promise<{ success: boolean; transaction: AccountingTransaction; syncedToSheet: boolean }> {
    const local = this.getLocalTransactions();
    const newRowNum = local.length > 0 ? Math.max(...local.map((t) => t.rowNum)) + 1 : 2;
    const newId = `tx-${Date.now()}`;

    const newTx: AccountingTransaction = {
      ...tx,
      id: newId,
      rowNum: newRowNum,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTx, ...local];
    this.saveLocalTransactions(updated);

    let syncedToSheet = false;
    if (this.apiUrl) {
      try {
        const payload = {
          action: 'addTransaction',
          event: newTx.event,
          date: newTx.date,
          cash: newTx.cash,
          ar: newTx.ar,
          inventory: newTx.inventory,
          ppe: newTx.ppe,
          prepaid: newTx.prepaid,
          godwill: newTx.godwill,
          ap: newTx.ap,
          tp: newTx.tp,
          np: newTx.np,
          origin: newTx.origin,
          retained: newTx.retained,
          earning: newTx.earning,
        };

        const res = await fetch(this.apiUrl, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script handles no-cors / text/plain smoothly
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });

        syncedToSheet = true;
      } catch (err) {
        console.warn('Could not post to Google Apps Script, saved locally:', err);
      }
    }

    return {
      success: true,
      transaction: newTx,
      syncedToSheet,
    };
  }

  /**
   * Delete transaction
   */
  public async deleteTransaction(
    id: string,
    rowNum: number
  ): Promise<{ success: boolean; syncedToSheet: boolean }> {
    const local = this.getLocalTransactions();
    const updated = local.filter((t) => t.id !== id);
    this.saveLocalTransactions(updated);

    let syncedToSheet = false;
    if (this.apiUrl && rowNum) {
      try {
        await fetch(this.apiUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'deleteTransaction',
            rowNum,
          }),
        });
        syncedToSheet = true;
      } catch (err) {
        console.warn('Could not post delete to Google Apps Script:', err);
      }
    }

    return { success: true, syncedToSheet };
  }

  /**
   * Update transaction approval
   */
  public updateApproval(id: string, status: 'approved' | 'rejected', approver: string): AccountingTransaction[] {
    const local = this.getLocalTransactions();
    const updated = local.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          approvalStatus: status,
          approvedBy: approver,
        };
      }
      return t;
    });
    this.saveLocalTransactions(updated);
    return updated;
  }

  /**
   * Export transactions as CSV string
   */
  public exportCsv(transactions: AccountingTransaction[]): string {
    const headers = [
      'No',
      'Tanggal',
      'Peristiwa / Transaksi',
      'Kategori',
      'Divisi',
      'Status Approval',
      'Cash',
      'AR',
      'Inventory',
      'PPE',
      'PrePaid',
      'GodWill',
      'AP',
      'TP',
      'NP',
      'Origin',
      'Retained',
      'Earning',
      'Dicatat Oleh',
    ];

    const rows = transactions.map((t, idx) => [
      idx + 1,
      `"${t.date}"`,
      `"${(t.event || '').replace(/"/g, '""')}"`,
      `"${t.category || '-'}"`,
      `"${t.division || '-'}"`,
      `"${t.approvalStatus}"`,
      t.cash,
      t.ar,
      t.inventory,
      t.ppe,
      t.prepaid,
      t.godwill,
      t.ap,
      t.tp,
      t.np,
      t.origin,
      t.retained,
      t.earning,
      `"${t.recordedBy}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const googleSheetsService = new GoogleSheetsService();
