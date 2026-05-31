'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Header() {
  const [streak, setStreak] = useState(0)
  const [avatar, setAvatar] = useState('⚔️')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_emoji')
        .eq('id', user.id)
        .single()

      if (profile?.avatar_emoji) setAvatar(profile.avatar_emoji)

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
      padding: '14px 16px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'linear-gradient(180deg, rgba(8,10,15,0.98) 70%, transparent)',
    }}>
      <div style={{ fontSize: 28, flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}>🇧🇷</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, letterSpacing: 1.5, color: '#F0EAD6', lineHeight: 1 }}>BR BROTHERHOOD</div>
        <div style={{ fontSize: 10, fontWeight: 500, color: 'rgba(240,234,214,0.4)', letterSpacing: 0.5, marginTop: 2 }}>#P9P2RRG · 39 membros</div>
      </div>
      <div
        onClick={() => router.push('/clan/streak')}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(255,107,26,0.08)',
          border: '1px solid rgba(255,107,26,0.2)',
          borderRadius: 20, padding: '5px 10px', cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>🔥</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 700, color: '#FF9A3C', lineHeight: 1, textShadow: '0 0 12px rgba(255,107,26,0.5)' }}>{streak}</span>
      </div>
      <div
        onClick={() => router.push('/clan/perfil')}
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #1a2a4a, #2a1a4a)',
          border: '1.5px solid rgba(200,151,58,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, cursor: 'pointer', flexShrink: 0
        }}
      >
        {avatar}
      </div>
    </div>
  )
}