'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'
import { AVATARS, getAvatar } from '@/lib/avatars'

// ── Página ────────────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const [avatarId, setAvatarId] = useState('warrior')
  const [displayName, setDisplayName] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [players, setPlayers] = useState<any[]>([])
  const [clanRole, setClanRole] = useState('member')
  const [toast, setToast] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500) }

  function roleInfo(role: string) {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      leader:   { label: 'Líder',    bg: '#FFDF00', color: '#3a1000' },
      coLeader: { label: 'Co-Líder', bg: '#f97316', color: '#fff' },
      admin:    { label: 'Ancião',   bg: '#7a5020', color: '#fff' },
      member:   { label: 'Membro',   bg: '#888',    color: '#fff' },
    }
    return map[role] || { label: role, bg: '#888', color: '#fff' }
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles').select('avatar_emoji, display_name, clan_role')
        .eq('id', user.id).single()

      // avatar_emoji agora guarda o id do avatar; fallback para 'warrior'
      if (profile?.avatar_emoji && AVATARS.find(a => a.id === profile.avatar_emoji)) {
        setAvatarId(profile.avatar_emoji)
      }
      if (profile?.clan_role) setClanRole(profile.clan_role)
      setDisplayName(profile?.display_name || user.email?.split('@')[0] || '')

      const { data: links } = await supabase.from('player_links').select('*').eq('user_id', user.id)
      if (links) setPlayers(links)
      setLoading(false)
    }
    load()
  }, [])

  async function saveAvatar(id: string) {
    setAvatarId(id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ avatar_emoji: id }).eq('id', user.id)
    showToast('✦ Avatar atualizado!')
  }

  async function saveName() {
    if (!displayName.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', user.id)
    setSaving(false)
    setEditingName(false)
    showToast('✦ Nome atualizado!')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <LoadingScreen />

  const role = roleInfo(clanRole)
  const currentAvatar = getAvatar(avatarId)

  const sectionHdr = (title: string) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, margin:'16px 0 8px' }}>
      <div style={{ fontSize:12, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:'0.5px', textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>{title}</div>
      <div style={{ flex:1, height:2, background:'linear-gradient(90deg,#c8960c,transparent)', borderRadius:1 }} />
    </div>
  )

  return (
    <div style={{ overflowY:'auto', height:'100%', padding:'16px 16px 40px' }}>

      {/* PERFIL CARD */}
      <div style={{ background:'linear-gradient(180deg,#f5ead8,#e8d8b8)', border:'2px solid #c8a870', borderRadius:14, padding:16, marginBottom:4, boxShadow:'0 4px 0 #a07040' }}>

        {/* Avatar + Nome */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:60, height:60, borderRadius:14, overflow:'hidden', flexShrink:0, boxShadow:'0 4px 0 rgba(0,0,0,0.3)' }}>
            <img src={currentAvatar.img} alt={currentAvatar.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            {editingName ? (
              <div style={{ display:'flex', gap:6 }}>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                  style={{ flex:1, background:'rgba(255,255,255,0.7)', border:'2px solid #c8960c', borderRadius:8, padding:'6px 10px', color:'#1a0800', fontFamily:"'Nunito',sans-serif", fontSize:15, fontWeight:900, outline:'none' }}
                />
                <button onClick={saveName} disabled={saving} style={{ background:'linear-gradient(180deg,#FFDF00,#c8960c)', border:'none', borderRadius:8, padding:'6px 12px', color:'#3a1000', fontWeight:900, fontSize:12, cursor:'pointer', boxShadow:'0 2px 0 #805800' }}>
                  {saving ? '...' : 'OK'}
                </button>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ fontSize:18, fontWeight:900, color:'#1a0800' }}>{displayName}</div>
                <button onClick={() => setEditingName(true)} style={{ background:'rgba(0,0,0,0.08)', border:'1px solid #c0a060', borderRadius:6, padding:'2px 7px', color:'#8a6030', fontSize:11, cursor:'pointer', fontWeight:900 }}>✏️</button>
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
              <span style={{ fontSize:9, fontWeight:900, padding:'2px 7px', borderRadius:6, textTransform:'uppercase', background:role.bg, color:role.color }}>{role.label}</span>
              <span style={{ fontSize:10, fontWeight:700, color:'#8a6030' }}>{email}</span>
            </div>
          </div>
        </div>

        {/* Avatar Picker */}
        <div style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8a6030', marginBottom:10 }}>Foto de perfil</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8 }}>
          {AVATARS.map(a => (
            <div key={a.id} onClick={() => saveAvatar(a.id)} style={{
              aspectRatio: '1', borderRadius:12, overflow:'hidden',
              border: `3px solid ${avatarId === a.id ? '#FFDF00' : 'transparent'}`,
              cursor:'pointer',
              boxShadow: avatarId === a.id ? '0 0 0 1px #805800, 0 3px 0 rgba(0,0,0,0.3)' : '0 3px 0 rgba(0,0,0,0.2)',
              opacity: avatarId === a.id ? 1 : 0.7,
              transition: 'all 0.15s',
              transform: avatarId === a.id ? 'scale(1.08)' : 'scale(1)',
            }}>
              <img src={a.img} alt={a.label} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </div>
          ))}
        </div>
      </div>

      {/* JOGADORES */}
      {sectionHdr('Jogadores vinculados')}
      {players.length === 0 ? (
        <div style={{ background:'linear-gradient(180deg,#fff3e0,#ffe0b8)', border:'2px solid #f97316', borderRadius:14, padding:16, textAlign:'center', boxShadow:'0 3px 0 #c2410c', marginBottom:12 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>⚠️</div>
          <div style={{ fontSize:13, fontWeight:900, color:'#7c2d12', marginBottom:4 }}>Você ainda não se identificou no clã</div>
          <div style={{ fontSize:11, fontWeight:700, color:'#c2410c', marginBottom:14 }}>Vincule seu jogador para ter acesso completo</div>
          <button onClick={() => router.push('/clan/onboarding')} style={{ background:'linear-gradient(180deg,#FFDF00,#c8960c)', border:'none', borderRadius:12, padding:'12px 24px', fontSize:13, fontWeight:900, color:'#3a1000', cursor:'pointer', boxShadow:'0 3px 0 #805800', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            Identificar meu jogador
          </button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:4 }}>
          {players.map(p => {
            const pr = roleInfo(p.player_role)
            return (
              <div key={p.id} style={{ background:'linear-gradient(180deg,#f0e4cc,#e0d0a8)', border:'2px solid #c8a870', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:12, boxShadow:'0 3px 0 #a07040' }}>
                <div style={{ width:36, height:36, borderRadius:10, overflow:'hidden', flexShrink:0, boxShadow:'0 2px 0 rgba(0,0,0,0.25)' }}>
                  <img src={currentAvatar.img} alt={currentAvatar.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:900, color:'#1a0800' }}>{p.player_name}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                    <span style={{ fontSize:8, fontWeight:900, padding:'1px 5px', borderRadius:5, textTransform:'uppercase', background:pr.bg, color:pr.color }}>{pr.label}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:'#8a6030' }}>{p.player_tag}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LOGOUT */}
      {sectionHdr('')}
      <button onClick={handleLogout} style={{ width:'100%', background:'linear-gradient(180deg,#f87171,#dc2626)', border:'none', borderRadius:12, padding:13, fontSize:13, fontWeight:900, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow:'0 4px 0 #7f1d1d', textTransform:'uppercase', letterSpacing:'0.5px' }}>
        ↩ Sair da conta
      </button>

      {toast && (
        <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(180deg,#f5ead8,#e8d8b8)', border:'2px solid #c8960c', borderRadius:20, padding:'10px 20px', fontSize:12, fontWeight:900, color:'#3a1000', zIndex:999, whiteSpace:'nowrap', boxShadow:'0 4px 0 #a07040' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
