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
  const [toast, setToast] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_emoji, display_name')
        .eq('id', user.id)
        .single()

      if (profile?.avatar_emoji) setAvatar(profile.avatar_emoji)
      if (profile?.display_name) setDisplayName(profile.display_name)
      else setDisplayName(user.email?.split('@')[0] || '')

      const { data: links } = await supabase
        .from('player_links')
        .select('*')
        .eq('user_id', user.id)

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

  function roleLabel(role: string) {
    const map: Record<string, string> = { leader: '👑 Líder', coLeader: '🔱 Co-Líder', admin: '⚜️ Ancião', member: '🗡️ Membro' }
    return map[role] || role
  }

  if (loading) return <LoadingScreen />

  return (
    <div style={{ padding: '16px 16px 100px', fontFamily: "'DM Sans', sans-serif", color: '#F0EAD6' }}>

      {/* PERFIL CARD */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,151,58,0.25)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#1a2a4a,#2a1a4a)', border: '2px solid #C8973A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            {avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingName ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  autoFocus
                  style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid #C8973A', borderRadius: 8, padding: '6px 10px', color: '#F0EAD6', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, outline: 'none' }}
                />
                <button onClick={saveName} disabled={saving} style={{ background: '#C8973A', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#080A0F', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {saving ? '...' : 'OK'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700 }}>{displayName}</div>
                <button onClick={() => setEditingName(true)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '3px 7px', color: 'rgba(240,234,214,0.4)', fontSize: 11, cursor: 'pointer' }}>✏️</button>
              </div>
            )}
            <div style={{ fontSize: 11, color: 'rgba(240,234,214,0.4)', marginTop: 2 }}>{email}</div>
          </div>
        </div>

        {/* EMOJI PICKER */}
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(240,234,214,0.4)', marginBottom: 8 }}>Foto de perfil</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EMOJIS.map(e => (
            <div key={e} onClick={() => saveAvatar(e)} style={{
              width: 44, height: 44, borderRadius: 10,
              background: avatar === e ? 'rgba(200,151,58,0.1)' : 'rgba(255,255,255,0.07)',
              border: `1.5px solid ${avatar === e ? '#C8973A' : 'rgba(255,255,255,0.07)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, cursor: 'pointer',
              boxShadow: avatar === e ? '0 0 12px rgba(200,151,58,0.2)' : 'none'
            }}>{e}</div>
          ))}
        </div>
      </div>

      {/* JOGADORES VINCULADOS */}
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        Jogadores vinculados
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
      </div>

      {players.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,107,26,0.2)', borderRadius: 14, padding: 16, textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Você ainda não se identificou no clã</div>
          <div style={{ fontSize: 11, color: 'rgba(240,234,214,0.4)', marginBottom: 14 }}>Vincule seu jogador para ter acesso completo ao app</div>
          <button onClick={() => router.push('/clan/onboarding')} style={{ background: 'linear-gradient(135deg,#C8973A,#E8B84B)', border: 'none', borderRadius: 12, padding: '12px 24px', fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 600, letterSpacing: 1, color: '#080A0F', cursor: 'pointer' }}>
            IDENTIFICAR MEU JOGADOR
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {players.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,151,58,0.15)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 24 }}>⚔️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.player_name}</div>
                <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)', fontWeight: 500 }}>{roleLabel(p.player_role)} · {p.player_tag}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGOUT */}
      <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 12, padding: 13, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#E74C3C', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        ↩ Sair da conta
      </button>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#0f1520', border: '1px solid rgba(200,151,58,0.3)', borderRadius: 20, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}