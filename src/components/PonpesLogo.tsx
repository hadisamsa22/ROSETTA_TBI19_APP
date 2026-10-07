import React from 'react';

interface PonpesLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const PonpesLogo: React.FC<PonpesLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-10',
    md: 'w-10 h-13',
    lg: 'w-14 h-18',
    xl: 'w-20 h-26',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Triangular Badge Logo */}
      <div className={`relative ${sizeClasses[size]} shrink-0 flex items-center justify-center filter drop-shadow-md`}>
        <img
          src="/src/assets/images/logo_pesantren_sains_tbi19_1791371351141.jpg"
          alt="Logo Pesantren Sains Tebuireng 19 Lombok"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Elegant SVG triangular fallback if image ever fails to load
            const parent = (e.target as HTMLElement).parentElement;
            if (parent) {
              parent.innerHTML = `
                <svg viewBox="0 0 100 130" class="w-full h-full">
                  <polygon points="50,2 96,126 4,126" fill="#0d0d0d" stroke="#d4af37" stroke-width="4" stroke-linejoin="round"/>
                  <polygon points="50,12 88,120 12,120" fill="#141414" stroke="#f59e0b" stroke-width="1"/>
                  <polygon points="50,18 53,28 63,28 55,34 58,44 50,38 42,44 45,34 37,28 47,28" fill="#fbbf24"/>
                  <circle cx="50" cy="85" r="10" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
                  <path d="M40,85 C25,75 25,60 30,55 C34,65 40,75 42,80" fill="#f59e0b"/>
                  <path d="M60,85 C75,75 75,60 70,55 C66,65 60,75 58,80" fill="#f59e0b"/>
                  <text x="50" y="52" fill="#fbbf24" font-size="7" font-weight="900" text-anchor="middle" font-family="sans-serif">TBI 19</text>
                  <text x="50" y="112" fill="#fbbf24" font-size="6" font-weight="900" text-anchor="middle" font-family="sans-serif">LOMBOK</text>
                </svg>
              `;
            }
          }}
        />
      </div>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-base tracking-tight">
              Pesantren Sains
            </span>
            <span className="text-amber-400 font-extrabold text-base tracking-tight">
              Tebuireng 19
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Khairul Wadi · Lombok Barat, NTB
          </p>
        </div>
      )}
    </div>
  );
};
