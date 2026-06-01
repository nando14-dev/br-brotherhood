'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Header() {
  const [streak, setStreak] = useState(0)
  const [avatar, setAvatar] = useState('⚔️')
  const [displayName, setDisplayName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_emoji, display_name')
        .eq('id', user.id)
        .single()

      if (profile?.avatar_emoji) setAvatar(profile.avatar_emoji)
      if (profile?.display_name) setDisplayName(profile.display_name)

      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)
        .single()

      if (streakData?.current_streak) setStreak(streakData.current_streak)
    }
    load()
  }, [])

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'linear-gradient(180deg, #0A1628 80%, transparent)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Flag + Nome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          overflow: 'hidden', flexShrink: 0,
          border: '2px solid rgba(0,156,59,0.5)',
          boxShadow: '0 0 12px rgba(0,156,59,0.3)',
        }}>
          <img src="https://flagcdn.com/w40/br.png" alt="BR" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontWeight: 900, fontSize: 15, letterSpacing: 0.5,
            color: '#F0F4FF', lineHeight: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>BR BROTHERHOOD</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,244,255,0.4)', marginTop: 1 }}>#P9P2RRG</div>
        </div>
      </div>

      {/* Streak */}
      <div
        onClick={() => router.push('/clan/streak')}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: streak > 0 ? 'rgba(255,107,26,0.15)' : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${streak > 0 ? 'rgba(255,107,26,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
          boxShadow: streak > 0 ? '0 0 12px rgba(255,107,26,0.2)' : 'none',
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1, animation: streak > 0 ? 'fire-sway 2s ease infinite alternate' : 'none' }}>🔥</span>
        <span style={{
          fontWeight: 900, fontSize: 18,
          color: streak > 0 ? '#FF9A3C' : 'rgba(240,244,255,0.3)',
          lineHeight: 1,
          textShadow: streak > 0 ? '0 0 12px rgba(255,107,26,0.5)' : 'none'
        }}>{streak}</span>
      </div>

      {/* Avatar */}
      <div
        onClick={() => router.push('/clan/perfil')}
        style={{
          width: 38, height: 38, borderRadius: 12,
          background: 'linear-gradient(135deg, #162440, #1C2E4A)',
          border: '2px solid rgba(255,223,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {avatar}
      </div>
    </div>
  )
}