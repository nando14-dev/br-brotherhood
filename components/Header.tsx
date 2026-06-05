'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import ReleaseNotes from '@/components/ReleaseNotes'
import { getAvatar } from '@/lib/avatars'

export default function Header() {
  const [streak, setStreak] = useState<number | null>(null)
  const [avatarId, setAvatarId] = useState<string | null>(null)
  const [flagTaps, setFlagTaps] = useState(0)
  const [showRelease, setShowRelease] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function handleFlagTap() {
    const next = flagTaps + 1
    setFlagTaps(next)
    if (next >= 10) {
      setShowRelease(true)
      setFlagTaps(0)
    } else {
      setTimeout(() => setFlagTaps(f => f === next ? 0 : f), 3000)
    }
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('avatar_emoji').eq('id', user.id).single()
      if (profile?.avatar_emoji) setAvatarId(profile.avatar_emoji)
      const { data: s } = await supabase.from('streaks').select('current_streak').eq('user_id', user.id).single()
      if (s?.current_streak) setStreak(s.current_streak)
    }
    load()
  }, [])

  return (
    <>
      <div style={{
        background: 'linear-gradient(180deg, #4a2a0a 0%, #6a3e18 50%, #4a2a0a 100%)',
        borderBottom: '3px solid #a07040',
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        flexShrink: 0, zIndex: 10, position: 'relative',
      }}>
        {/* BANDEIRA — easter egg 10 taps */}
        <div
          onClick={handleFlagTap}
          style={{ width:36, height:36, borderRadius:8, overflow:'hidden', border:'2px solid #c8960c', boxShadow:'0 0 8px rgba(200,150,0,0.4)', flexShrink:0, cursor:'pointer' }}
        >
          <img src="/dragon.webp" alt="Dragon" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:900, color:'#fff', textShadow:'0 1px 3px rgba(0,0,0,0.6)', letterSpacing:'0.5px', lineHeight:1 }}>BR BROTHERHOOD</div>
          <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', marginTop:2, letterSpacing:'1px', textTransform:'uppercase' }}>#P9P2RRG</div>
        </div>

        {streak === null ? (
          <div style={{ width:60, height:32, borderRadius:20, background:'rgba(255,255,255,0.08)', border:'2px solid rgba(249,115,22,0.3)', flexShrink:0 }} />
        ) : (
          <div onClick={() => router.push('/clan/streak')} style={{ display:'flex', alignItems:'center', gap:4, background:'linear-gradient(135deg,#7c2d12,#c2410c)', border:'2px solid #f97316', borderRadius:20, padding:'4px 10px', boxShadow:'0 3px 0 rgba(0,0,0,0.4)', cursor:'pointer' }}>
            <span style={{ fontSize:18, lineHeight:1 }}>🔥</span>
            <span style={{ fontSize:16, fontWeight:900, color:'#fed7aa', lineHeight:1 }}>{streak}</span>
          </div>
        )}

        {avatarId === null ? (
          <div style={{ width:36, height:36, borderRadius:8, border:'2px solid rgba(200,150,12,0.3)', background:'rgba(255,255,255,0.08)', flexShrink:0 }} />
        ) : (
          <div onClick={() => router.push('/clan/perfil')} style={{ width:36, height:36, borderRadius:8, overflow:'hidden', border:'2px solid #c8960c', cursor:'pointer', flexShrink:0, boxShadow:'0 3px 0 rgba(0,0,0,0.4)' }}>
            <img src={getAvatar(avatarId).img} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        )}
      </div>

      {showRelease && (
        <ReleaseNotes forceOpen={showRelease} onClose={() => setShowRelease(false)} />
      )}
    </>
  )
}