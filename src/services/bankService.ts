import { BankAccount, BankMutation } from '../types/accounting';
import { INITIAL_BANK_ACCOUNTS, INITIAL_BANK_MUTATIONS } from '../data/initialData';

const STORAGE_KEY_BANK_ACCOUNTS = 'tebuireng19_bank_accounts_v2';
const STORAGE_KEY_BANK_MUTATIONS = 'tebuireng19_bank_mutations_v2';

export class BankService {
  public getAccounts(): BankAccount[] {
    if (typeof window === 'undefined') return INITIAL_BANK_ACCOUNTS;
    const stored = localStorage.getItem(STORAGE_KEY_BANK_ACCOUNTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_BANK_ACCOUNTS, JSON.stringify(INITIAL_BANK_ACCOUNTS));
      return INITIAL_BANK_ACCOUNTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_BANK_ACCOUNTS;
    }
  }

  public saveAccounts(accounts: BankAccount[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BANK_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  public getMutations(): BankMutation[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY_BANK_MUTATIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_BANK_MUTATIONS, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public saveMutations(mutations: BankMutation[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BANK_MUTATIONS, JSON.stringify(mutations));
    }
  }

  public clearAllMutations() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_BANK_MUTATIONS);
      localStorage.removeItem('tebuireng19_bank_mutations_v1');
      localStorage.setItem(STORAGE_KEY_BANK_MUTATIONS, JSON.stringify([]));
    }
  }

  /**
   * Sync accounts with simulated bank feed API
   */
  public async syncBankFeed(): Promise<{
    newMutationsCount: number;
    accounts: BankAccount[];
    mutations: BankMutation[];
  }> {
    // Artificial latency to simulate connecting to Bank API (BSI Open Banking / BI-FAST)
    await new Promise((r) => setTimeout(r, 800));

    const accounts = this.getAccounts().map((acc) => ({
      ...acc,
      lastSynced: new Date().toISOString(),
    }));
    this.saveAccounts(accounts);

    const mutations = this.getMutations();
    return {
      newMutationsCount: mutations.filter((m) => !m.isReconciled).length,
      accounts,
      mutations,
    };
  }

  /**
   * Mark bank mutation as reconciled
   */
  public markReconciled(mutationId: string, txId: string) {
    const mutations = this.getMutations().map((m) => {
      if (m.id === mutationId) {
        return {
          ...m,
          isReconciled: true,
          matchedTransactionId: txId,
        };
      }
      return m;
    });
    this.saveMutations(mutations);
    return mutations;
  }

  /**
   * Simulate new incoming live bank transaction
   */
  public generateSimulatedIncomingTransaction(): BankMutation {
    const isIncome = Math.random() > 0.35; // 65% chance income
    const samples = isIncome
      ? [
          {
            desc: 'TRF BSI SYAHRIAH SANTRI M. RAYHAN KLS 9',
            sender: 'DR. H. M. YUSUF (WALI SANTRI)',
            amount: 1500000,
            account: 'bsi-operasional',
            bankName: 'BSI',
          },
          {
            desc: 'INFAQ PEMBANGUNAN MASJID DARI DONATUR MATARAM',
            sender: 'KELUARGA BESAR H. MAHSUN MATARAM',
            amount: 5000000,
            account: 'ntb-pembangunan',
            bankName: 'Bank NTB Syariah',
          },
          {
            desc: 'TRF SYAHRIAH & INFAQ MAKAN SANTRIWATI AISYAH',
            sender: 'IBU SITI NURHALIZA (LOMBOK BARAT)',
            amount: 1750000,
            account: 'bsi-operasional',
            bankName: 'BSI',
          },
        ]
      : [
          {
            desc: 'DEBET AUTODEBET LISTRIK ASRAMA PUTRI BLOK C',
            sender: 'PLN PERSERO UP3 MATARAM',
            amount: 1450000,
            account: 'bsi-operasional',
            bankName: 'BSI',
          },
          {
            desc: 'PEMBELIAN GAS ELPIJI 50KG DAPUR SANTRI',
            sender: 'AGEN GAS LABUAPI LOMBOK',
            amount: 980000,
            account: 'bsi-operasional',
            bankName: 'BSI',
          },
        ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    const now = new Date();
    const newMut: BankMutation = {
      id: `mut-${Date.now()}`,
      bankAccountId: pick.account,
      bankName: pick.bankName,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      type: isIncome ? 'CR' : 'DB',
      amount: pick.amount,
      description: pick.desc,
      referenceNumber: `${pick.bankName.replace(/[^A-Z]/g, '')}-${now.getTime().toString().slice(-6)}`,
      senderOrRecipient: pick.sender,
      isReconciled: false,
    };

    const mutations = [newMut, ...this.getMutations()];
    this.saveMutations(mutations);

    // Update account balance
    const accounts = this.getAccounts().map((acc) => {
      if (acc.id === pick.account) {
        return {
          ...acc,
          balance: isIncome ? acc.balance + pick.amount : acc.balance - pick.amount,
          lastSynced: now.toISOString(),
        };
      }
      return acc;
    });
    this.saveAccounts(accounts);

    return newMut;
  }

  /**
   * Parse uploaded CSV file of bank mutation
   */
  public parseBankStatementCsv(csvText: string, bankAccountId: string): BankMutation[] {
    const lines = csvText.trim().split('\n');
    const newMutations: BankMutation[] = [];
    const accounts = this.getAccounts();
    const targetAccount = accounts.find((a) => a.id === bankAccountId) || accounts[0];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());

      // Try reading Date, Desc, Type, Amount
      const date = parts[0] || new Date().toISOString().split('T')[0];
      const desc = parts[1] || 'Mutasi Bank Import';
      const typeStr = (parts[2] || '').toUpperCase();
      const type: 'CR' | 'DB' = typeStr.includes('CR') || typeStr.includes('MASUK') || typeStr.includes('KREDIT') ? 'CR' : 'DB';
      const amount = Math.abs(parseFloat(parts[3] || '0')) || 100000;
      const sender = parts[4] || 'Mutasi Bank';

      newMutations.push({
        id: `mut-imp-${Date.now()}-${i}`,
        bankAccountId: targetAccount.id,
        bankName: targetAccount.bankName,
        date,
        time: '10:00:00',
        type,
        amount,
        description: desc,
        referenceNumber: `IMP-${Date.now().toString().slice(-5)}-${i}`,
        senderOrRecipient: sender,
        isReconciled: false,
      });
    }

    if (newMutations.length > 0) {
      const current = this.getMutations();
      this.saveMutations([...newMutations, ...current]);
    }

    return newMutations;
  }
}

export const bankService = new BankService();
