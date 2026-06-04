'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

const EMOJIS = ['⚔️','🐲','🐸','🔥','👑','🛡️','💀','⚡','🏹','🗡️']

export default function PerfilPage() {
  const [avatar, setAvatar] = useState('⚔️')
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

      if (profile?.avatar_emoji) setAvatar(profile.avatar_emoji)
      if (profile?.clan_role) setClanRole(profile.clan_role)
      setDisplayName(profile?.display_name || user.email?.split('@')[0] || '')

      const { data: links } = await supabase.from('player_links').select('*').eq('user_id', user.id)
      if (links) setPlayers(links)
      setLoading(false)
    }
    load()
  }, [])

  async function saveAvatar(emoji: string) {
    setAvatar(emoji)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ avatar_emoji: emoji }).eq('id', user.id)
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

  const sectionHdr = (title: string) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, margin:'16px 0 8px' }}>
      <div style={{ fontSize:12, fontWeight:900, color:'#3a1000', textTransform:'uppercase', letterSpacing:'0.5px' }}>{title}</div>
      <div style={{ flex:1, height:2, background:'linear-gradient(90deg,#c8960c,transparent)', borderRadius:1 }} />
    </div>
  )

  return (
    <div style={{ overflowY:'auto', height:'100%', padding:'16px 16px 40px' }}>

      {/* PERFIL CARD */}
      <div style={{ background:'linear-gradient(180deg,#f5ead8,#e8d8b8)', border:'2px solid #c8a870', borderRadius:14, padding:16, marginBottom:4, boxShadow:'0 4px 0 #a07040' }}>

        {/* Avatar + Nome */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <div style={{ width:60, height:60, borderRadius:14, background:'linear-gradient(135deg,#4a2810,#2a1808)', border:'3px solid #c8960c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, flexShrink:0, boxShadow:'0 4px 0 #805800' }}>
            {avatar}
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

        {/* Emoji Picker */}
        <div style={{ fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:'1.5px', color:'#8a6030', marginBottom:8 }}>Foto de perfil</div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {EMOJIS.map(e => (
            <div key={e} onClick={() => saveAvatar(e)} style={{
              width:44, height:44, borderRadius:10,
              background: avatar === e ? 'linear-gradient(180deg,#FFDF00,#c8960c)' : 'rgba(255,255,255,0.5)',
              border: `2px solid ${avatar === e ? '#c8960c' : '#c0a060'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:22, cursor:'pointer',
              boxShadow: avatar === e ? '0 3px 0 #805800' : '0 2px 0 #a07040',
            }}>{e}</div>
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
                <div style={{ fontSize:24 }}>⚔️</div>
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