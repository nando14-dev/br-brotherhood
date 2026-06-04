export default function DragonIcon({ size = 36, color = '#c8960c' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Raios externos — 8 pontas */}
      <path
        d="M24 2 L27 13 L36 6 L33 17 L45 16 L37 24 L45 32 L33 31 L36 42 L27 35 L24 46 L21 35 L12 42 L15 31 L3 32 L11 24 L3 16 L15 17 L12 6 L21 13 Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round"
      />
      {/* Sobrancelhas raivosas */}
      <path d="M15 21 L20 23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M33 21 L28 23" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* Olhos em V */}
      <path d="M14 24 L17.5 22 L14 28" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M34 24 L30.5 22 L34 28" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Nariz */}
      <path d="M22 28 L24 30 L26 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Boca com presas */}
      <path d="M17 33 L19.5 30 L21 33 L24 30 L27 33 L28.5 30 L31 33"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
