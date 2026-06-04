export const AVATARS = [
  { id: 'barbarian',      label: 'Barbarian',       img: '/avatars/Barbarian_League.webp' },
  { id: 'archer',         label: 'Archer',          img: '/avatars/Archer_League.webp' },
  { id: 'wizard',         label: 'Wizard',          img: '/avatars/Wizard_League.webp' },
  { id: 'valkyrie',       label: 'Valkyrie',        img: '/avatars/Valkyrie_League.webp' },
  { id: 'golem',          label: 'Golem',           img: '/avatars/Golem_League.webp' },
  { id: 'witch',          label: 'Witch',           img: '/avatars/Witch_League.webp' },
  { id: 'skeleton',       label: 'Skeleton',        img: '/avatars/Skeleton_League.webp' },
  { id: 'pekka',          label: 'PEKKA',           img: '/avatars/PEKKA_League.webp' },
  { id: 'dragon',         label: 'Dragon',          img: '/avatars/Dragon_League.webp' },
  { id: 'electro_dragon', label: 'Electro Dragon',  img: '/avatars/Electro_Dragon_League.webp' },
  { id: 'electro_titan',  label: 'Electro Titan',   img: '/avatars/Electro_Titan_League.webp' },
]

export function getAvatar(id: string) {
  return AVATARS.find(a => a.id === id) ?? AVATARS[0]
}
