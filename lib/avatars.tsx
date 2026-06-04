export const AVATARS = [
  {
    id: 'warrior', label: 'Guerreiro', color: '#991b1b',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16" y1="4" x2="16" y2="24"/>
        <line x1="11" y1="9" x2="21" y2="9"/>
        <path d="M13 24 L11 28 L13.5 30 L16 27 L18.5 30 L21 28 L19 24"/>
      </svg>
    ),
  },
  {
    id: 'king', label: 'Rei', color: '#92400e',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 26 L6 16 L11 21 L16 12 L21 21 L26 16 L26 26 Z"/>
        <line x1="6" y1="26" x2="26" y2="26"/>
        <circle cx="16" cy="10" r="2" fill="white"/>
        <circle cx="6" cy="14" r="1.5" fill="white"/>
        <circle cx="26" cy="14" r="1.5" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'wizard', label: 'Mago', color: '#581c87',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4 L8 26 L24 26 Z"/>
        <ellipse cx="16" cy="26" rx="6" ry="2"/>
        <circle cx="22" cy="10" r="1.5" fill="white" stroke="none"/>
        <circle cx="10" cy="16" r="1" fill="white" stroke="none"/>
        <circle cx="24" cy="18" r="1" fill="white" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'archer', label: 'Arqueira', color: '#166534',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6 Q4 16 8 26"/>
        <line x1="8" y1="16" x2="26" y2="16"/>
        <polyline points="21,11 26,16 21,21"/>
        <line x1="8" y1="6" x2="8" y2="26" strokeDasharray="2 3" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'shield', label: 'Cavaleiro', color: '#1e3a8a',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4 L26 8 L26 18 Q26 26 16 30 Q6 26 6 18 L6 8 Z"/>
        <line x1="16" y1="10" x2="16" y2="24"/>
        <line x1="10" y1="17" x2="22" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'skull', label: 'Caveira', color: '#1f2937',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 20 Q8 8 16 8 Q24 8 24 20 L24 24 L8 24 Z"/>
        <line x1="11" y1="24" x2="11" y2="28"/>
        <line x1="16" y1="24" x2="16" y2="28"/>
        <line x1="21" y1="24" x2="21" y2="28"/>
        <line x1="8" y1="28" x2="24" y2="28"/>
        <circle cx="12" cy="18" r="2.5" fill="white" stroke="none"/>
        <circle cx="20" cy="18" r="2.5" fill="white" stroke="none"/>
      </svg>
    ),
  },
  {
    id: 'dragon', label: 'Dragão', color: '#14532d',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 24 Q4 16 10 12 Q14 8 20 10 Q26 12 24 19 Q22 25 14 26 Q9 27 6 24 Z"/>
        <circle cx="20" cy="13" r="1.5" fill="white" stroke="none"/>
        <path d="M24 17 Q28 13 30 9"/>
        <path d="M6 24 L4 29"/>
        <path d="M10 12 L8 7 L13 10"/>
      </svg>
    ),
  },
  {
    id: 'lightning', label: 'Raio', color: '#713f12',
    svg: (
      <svg viewBox="0 0 32 32">
        <path d="M20 4 L10 18 L16 18 L12 28 L22 14 L16 14 Z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'fire', label: 'Fogo', color: '#7c2d12',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 28 Q8 24 10 16 Q12 10 16 8 Q16 12 18 12 Q22 8 20 4 Q26 8 26 16 Q26 24 16 28 Z"/>
        <path d="M16 28 Q12 24 14 20 Q16 18 18 20 Q18 24 16 28 Z" fill="white"/>
      </svg>
    ),
  },
  {
    id: 'castle', label: 'Castelo', color: '#374151',
    svg: (
      <svg viewBox="0 0 32 32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="18" width="20" height="10"/>
        <rect x="6" y="10" width="4" height="8"/>
        <rect x="14" y="10" width="4" height="8"/>
        <rect x="22" y="10" width="4" height="8"/>
        <path d="M6 10 L6 8 L10 8 L10 10 M14 10 L14 8 L18 8 L18 10 M22 10 L22 8 L26 8 L26 10"/>
        <rect x="13" y="22" width="6" height="6"/>
      </svg>
    ),
  },
]

export function getAvatar(id: string) {
  return AVATARS.find(a => a.id === id) ?? AVATARS[0]
}
