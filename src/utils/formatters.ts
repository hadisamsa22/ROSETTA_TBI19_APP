export function formatRupiah(value: number | string | undefined | null): string {
  const num = Number(value) || 0;
  const isNegative = num < 0;
  const absValue = Math.abs(num);
  const formatted = absValue.toLocaleString('id-ID');
  return `${isNegative ? '-Rp ' : 'Rp '}${formatted}`;
}

export function formatCompactRupiah(value: number | string | undefined | null): string {
  const num = Number(value) || 0;
  const absValue = Math.abs(num);
  if (absValue >= 1_000_000_000) {
    return `${num < 0 ? '-' : ''}Rp ${(absValue / 1_000_000_000).toFixed(1)} M`;
  }
  if (absValue >= 1_000_000) {
    return `${num < 0 ? '-' : ''}Rp ${(absValue / 1_000_000).toFixed(1)} Jt`;
  }
  if (absValue >= 1_000) {
    return `${num < 0 ? '-' : ''}Rp ${(absValue / 1_000).toFixed(0)} Rb`;
  }
  return formatRupiah(num);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateTimeStr: string): string {
  if (!dateTimeStr) return '-';
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateTimeStr;
  }
}

/**
 * Clean Web Audio API chime sound generator
 * No external audio files needed - runs instantaneously in browser
 */
export function playChimeSound(type: 'income' | 'expense' | 'alert' = 'income') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    if (type === 'income') {
      // Pleasant high double chime (Ascending major third)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.12); // A5
      
      osc2.frequency.setValueAtTime(1174.66, now + 0.12); // D6
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.6);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
    } else if (type === 'expense') {
      // Gentle neutral notification
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(392, now + 0.1); // G4
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Alert soft beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.debug('Audio notification not supported or user has not interacted yet', e);
  }
}

/**
 * Generate formatted WhatsApp message link for financial notification
 */
export function generateWhatsAppMessageUrl(
  phone: string,
  event: string,
  amount: number,
  type: string,
  recordedBy: string,
  date: string,
  balance: number
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const targetPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
  
  const text = `*PEMBERITAHUAN KEUANGAN PONPES TEBUIRENG 19 LOMBOK* 🕌
----------------------------------------
*Status:* ${type === 'income' ? '🟢 Pemasukan Tercatat' : '🔴 Pengeluaran Tercatat'}
*Keterangan:* ${event}
*Nominal:* ${formatRupiah(amount)}
*Tanggal:* ${formatDateIndo(date)}
*Dicatat Oleh:* ${recordedBy}
*Saldo Kas Berjalan:* ${formatRupiah(balance)}
----------------------------------------
_Sistem Transparansi Keuangan Terpadu Ponpes Tebuireng 19 Lombok_
_Data tersinkronisasi otomatis ke Google Sheets_`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
