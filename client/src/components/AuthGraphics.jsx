import React from 'react';

/**
 * Modern vector SVG illustrations tailored for Job Finder India
 * Obsidian & Emerald themed graphics for Authentication & OTP workflows
 */

export function SecurityShieldGraphic({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 10px 25px rgba(16, 185, 129, 0.25))' }}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="40" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="0.5" stopColor="#059669" />
          <stop offset="1" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="coreGrad" x1="70" y1="60" x2="130" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <radialGradient id="glowRing" cx="100" cy="100" r="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" stopOpacity="0.3" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient background glow */}
      <circle cx="100" cy="100" r="75" fill="url(#glowRing)" />

      {/* Cyber circuit orbits */}
      <circle cx="100" cy="100" r="86" stroke="#10B981" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="6 6" />
      <circle cx="100" cy="100" r="68" stroke="#34D399" strokeOpacity="0.15" strokeWidth="1" />

      {/* Orbiting data nodes */}
      <circle cx="186" cy="100" r="3.5" fill="#10B981" />
      <circle cx="14" cy="100" r="3" fill="#34D399" />
      <circle cx="100" cy="14" r="4" fill="#10B981" />
      <circle cx="100" cy="186" r="3.5" fill="#059669" />

      {/* Outer Shield Shell */}
      <path
        d="M100 24L156 46C156 94 136 148 100 176C64 148 44 94 44 46L100 24Z"
        fill="#0E1114"
        stroke="url(#shieldGrad)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Inner Shield Layer */}
      <path
        d="M100 38L144 56C144 94 128 136 100 160C72 136 56 94 56 56L100 38Z"
        fill="#141920"
        stroke="#10B981"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />

      {/* Padlock Body */}
      <rect x="80" y="94" width="40" height="34" rx="7" fill="url(#coreGrad)" />
      
      {/* Padlock Shackle */}
      <path
        d="M87 94V78C87 70.82 92.82 65 100 65C107.18 65 113 70.82 113 78V94"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Keyhole */}
      <circle cx="100" cy="108" r="3.5" fill="#0E1114" />
      <path d="M100 111.5V119" stroke="#0E1114" strokeWidth="2.5" strokeLinecap="round" />

      {/* Verification Checkmark Floating Badge */}
      <circle cx="140" cy="62" r="14" fill="#10B981" />
      <path d="M134 62L138 66L146 58" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CareerRocketGraphic({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 10px 25px rgba(16, 185, 129, 0.22))' }}
    >
      <defs>
        <linearGradient id="rocketBody" x1="100" y1="30" x2="100" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FAFC" />
          <stop offset="0.7" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id="rocketFlame" x1="100" y1="130" x2="100" y2="185" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="0.5" stopColor="#10B981" />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>
        <radialGradient id="launchAura" cx="100" cy="100" r="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" stopOpacity="0.25" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Aura */}
      <circle cx="100" cy="100" r="80" fill="url(#launchAura)" />

      {/* Orbit Rings & Tech Grid */}
      <circle cx="100" cy="100" r="84" stroke="#10B981" strokeOpacity="0.15" strokeWidth="1.5" strokeDasharray="4 8" />
      
      {/* Code Glyph Stars */}
      <text x="32" y="55" fill="#10B981" fontSize="12" fontWeight="bold" opacity="0.6">&lt;/&gt;</text>
      <text x="148" y="70" fill="#34D399" fontSize="12" fontWeight="bold" opacity="0.7">&#123; &#125;</text>
      <text x="28" y="145" fill="#10B981" fontSize="14" fontWeight="bold" opacity="0.5">₹</text>
      <text x="156" y="140" fill="#34D399" fontSize="10" fontWeight="bold" opacity="0.7">LPA</text>

      {/* Rocket Flame / Exhaust */}
      <path
        d="M88 132C88 155 96 182 100 186C104 182 112 155 112 132H88Z"
        fill="url(#rocketFlame)"
      />
      <path
        d="M93 132C93 148 98 168 100 172C102 168 107 148 107 132H93Z"
        fill="#F59E0B"
      />

      {/* Left & Right Wings */}
      <path d="M78 105L58 130C58 130 68 134 82 128L80 105H78Z" fill="#10B981" />
      <path d="M122 105L142 130C142 130 132 134 118 128L120 105H122Z" fill="#059669" />

      {/* Rocket Main Fuselage */}
      <path
        d="M100 28C86 52 80 90 80 130H120C120 90 114 52 100 28Z"
        fill="url(#rocketBody)"
        stroke="#0F172A"
        strokeWidth="1.5"
      />

      {/* Rocket Nose Cone Accent */}
      <path
        d="M100 28C93 42 89 58 87 72H113C111 58 107 42 100 28Z"
        fill="#10B981"
      />

      {/* Porthole Window */}
      <circle cx="100" cy="85" r="11" fill="#0E1114" stroke="#10B981" strokeWidth="2.5" />
      <circle cx="100" cy="85" r="7" fill="#34D399" fillOpacity="0.4" />
      <path d="M96 82C98 80 102 80 104 82" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ResetKeyGraphic({ size = 160 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 10px 25px rgba(245, 158, 11, 0.22))' }}
    >
      <defs>
        <linearGradient id="keyGold" x1="50" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" />
          <stop offset="0.5" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <radialGradient id="resetAura" cx="100" cy="100" r="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" stopOpacity="0.25" />
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="100" r="78" fill="url(#resetAura)" />
      <circle cx="100" cy="100" r="85" stroke="#F59E0B" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="5 7" />

      {/* Safe Vault Backplate */}
      <rect x="52" y="52" width="96" height="96" rx="20" fill="#141920" stroke="#F59E0B" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="32" stroke="#334155" strokeWidth="3" strokeDasharray="4 4" />

      {/* Key Bow (Handle) */}
      <circle cx="78" cy="88" r="18" fill="none" stroke="url(#keyGold)" strokeWidth="6" />
      <circle cx="78" cy="88" r="6" fill="#10B981" />

      {/* Key Shaft */}
      <path
        d="M93 98L136 141"
        stroke="url(#keyGold)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Key Teeth */}
      <path d="M125 130L135 120" stroke="url(#keyGold)" strokeWidth="5" strokeLinecap="round" />
      <path d="M133 138L145 126" stroke="url(#keyGold)" strokeWidth="5" strokeLinecap="round" />

      {/* Glowing Security Badge */}
      <circle cx="140" cy="62" r="14" fill="#10B981" />
      <path d="M140 56V64M140 68V69" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
