'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

const EMOJIS = ['⚔️','🐲','🐸','🔥','👑','🛡️','💀','⚡','🏹','🗡️']

export default function PerfilPage() {
  const [avatar, setAvatar] = useState('⚔️')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [players, setPlayers] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_emoji')
        .eq('id', user.id)
        .single()

      if (profile?.avatar_emoji) setAvatar(profile.avatar_emoji)

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
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
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
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700 }}>{email.split('@')[0]}</div>
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
            }}>
              {e}
            </div>
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
                <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)', fontWeight: 500 }}>{p.player_role} · {p.player_tag}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOGOUT */}
      <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 12, padding: 13, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#E74C3C', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        ↩ Sair da conta
      </button>

    </div>
  )
}