'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import ReleaseNotes from '@/components/ReleaseNotes'

export default function Header() {
  const [streak, setStreak] = useState(0)
  const [avatar, setAvatar] = useState('⚔️')
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
      if (profile?.avatar_emoji) setAvatar(profile.avatar_emoji)
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
          style={{ width:36, height:36, borderRadius:8, overflow:'hidden', border:'2px solid #c8960c', boxShadow:'0 0 8px rgba(200,150,0,0.4)', flexShrink:0, cursor:'pointer', position:'relative' }}
        >
          <img src="https://flagcdn.com/w40/br.png" alt="BR" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:900, color:'#fff', textShadow:'0 1px 3px rgba(0,0,0,0.6)', letterSpacing:'0.5px', lineHeight:1 }}>BR BROTHERHOOD</div>
          <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.5)', marginTop:2, letterSpacing:'1px' }}>#P9P2RRG · 39 membros</div>
        </div>

        <div onClick={() => router.push('/clan/streak')} style={{ display:'flex', alignItems:'center', gap:4, background:'linear-gradient(135deg,#7c2d12,#c2410c)', border:'2px solid #f97316', borderRadius:20, padding:'4px 10px', boxShadow:'0 3px 0 rgba(0,0,0,0.4)', cursor:'pointer' }}>
          <span style={{ fontSize:18, lineHeight:1 }}>🔥</span>
          <span style={{ fontSize:16, fontWeight:900, color:'#fed7aa', lineHeight:1 }}>{streak}</span>
        </div>

        <div onClick={() => router.push('/clan/perfil')} style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,#1a3a6a,#2a1a5a)', border:'2px solid #c8960c', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer', flexShrink:0, boxShadow:'0 3px 0 rgba(0,0,0,0.4)' }}>
          {avatar}
        </div>
      </div>

      {showRelease && (
        <ReleaseNotes forceOpen={showRelease} onClose={() => setShowRelease(false)} />
      )}
    </>
  )
}