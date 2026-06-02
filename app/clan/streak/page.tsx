'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

interface StreakUser {
  user_id: string
  current_streak: number
  last_checkin: string
  profiles: { display_name: string; avatar_emoji: string }
}

const ACHIEVEMENTS = [
  { id: 'day1',  icon: '🌱', name: 'Tava aqui quando tudo era mato...', desc: 'Entrou no app no primeiro dia', req: 1 },
  { id: 'day7',  icon: '🔥', name: 'TÁ PEGANDO FOGO, BICHO!',             desc: '7 dias seguidos no app',        req: 7 },
  { id: 'day14', icon: '🏆', name: 'Bicho véio',                            desc: '14 dias seguidos no app',       req: 14 },
  { id: 'day30', icon: '🔱', name: 'Lenda do Clã',                        desc: '30 dias seguidos no app',       req: 30 },
]

const REWARDS = [
  { days: 3,  label: '+15 pts bônus',          desc: 'Primeiros passos' },
  { days: 7,  label: '+40 pts bônus',          desc: 'Uma semana inteira!' },
  { days: 14, label: 'Título especial',        desc: 'Dedicação total' },
  { days: 30, label: 'Voto em promoção',       desc: 'Lenda do clã' },
]

export default function StreakPage() {
  const [myStreak, setMyStreak] = useState(0)
  const [allStreaks, setAllStreaks] = useState<StreakUser[]>([])
  const [loading, setLoading] = useState(true)
  const [checkedIn, setCheckedIn] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: myData } = await supabase
        .from('streaks').select('current_streak, last_checkin')
        .eq('user_id', user.id).single()

      if (myData) {
        setMyStreak(myData.current_streak)
        const today = new Date().toLocaleDateString('en-CA')
        setCheckedIn(myData.last_checkin === today)
      }

      const { data: allData } = await supabase
        .from('streaks')
        .select('user_id, current_streak, last_checkin, profiles(display_name, avatar_emoji)')
        .order('current_streak', { ascending: false })
        .limit(9)

      if (allData) setAllStreaks(allData as any)
      setLoading(false)
    }
    load()
  }, [])

  async function doCheckin() {
    if (checkedIn) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toLocaleDateString('en-CA')
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toLocaleDateString('en-CA')

    const { data: existing } = await supabase.from('streaks').select('*').eq('user_id', user.id).single()
    let newStreak = 1

    if (existing) {
      newStreak = existing.last_checkin === yesterdayStr ? existing.current_streak + 1 : 1
      await supabase.from('streaks').update({ current_streak: newStreak, last_checkin: today }).eq('user_id', user.id)
    } else {
      await supabase.from('streaks').insert({ user_id: user.id, current_streak: 1, last_checkin: today })
    }

    setMyStreak(newStreak)
    setCheckedIn(true)
  }

  const sectionHdr = (title: string) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, margin:'4px 0 8px' }}>
      <div style={{ fontSize:12, fontWeight:900, color:'#3a1000', textTransform:'uppercase', letterSpacing:'0.5px' }}>{title}</div>
      <div style={{ flex:1, height:2, background:'linear-gradient(90deg,#c8960c,transparent)', borderRadius:1 }} />
    </div>
  )

  if (loading) return <LoadingScreen />

  return (
    <div style={{ overflowY:'auto', height:'100%', padding:'10px 10px 20px' }}>

      {/* MEU STREAK */}
      <div style={{ background:'linear-gradient(135deg,#7c2d12,#c2410c)', border:'2px solid #f97316', borderRadius:14, padding:16, marginBottom:10, display:'flex', alignItems:'center', gap:14, boxShadow:'0 4px 0 #5a1a08' }}>
        <div style={{ fontSize:52, animation:'fire-sway 2s ease infinite alternate' }}>🔥</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:18, fontWeight:900, color:'#fed7aa', marginBottom:4 }}>Sua Sequência</div>
          <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,215,170,0.7)', lineHeight:1.5 }}>
            {checkedIn ? 'Check-in feito hoje! Volte amanhã.' : 'Faça check-in para manter sua sequência!'}
          </div>
          {!checkedIn && (
            <button onClick={doCheckin} style={{ marginTop:10, background:'linear-gradient(180deg,#FFDF00,#c8960c)', border:'none', borderRadius:10, padding:'8px 16px', fontSize:12, fontWeight:900, color:'#3a1000', cursor:'pointer', boxShadow:'0 3px 0 #805800', letterSpacing:'0.5px', textTransform:'uppercase' }}>
              Fazer Check-in
            </button>
          )}
        </div>
        <div style={{ fontSize:52, fontWeight:900, color:'#fff', lineHeight:1, textShadow:'0 0 20px rgba(255,107,26,0.5)' }}>{myStreak}</div>
      </div>

      {/* SEQUÊNCIAS DO CLÃ */}
      {sectionHdr('🔥 Sequências do Clã')}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
        {allStreaks.map((s, i) => (
          <div key={s.user_id} style={{
            background: i === 0 ? 'linear-gradient(180deg,#fff3e0,#ffe0b8)' : 'linear-gradient(180deg,#f0e4cc,#e0d0a8)',
            border: `2px solid ${i === 0 ? '#f97316' : '#c0a060'}`,
            borderRadius: 12, padding: '12px 8px', textAlign: 'center',
            boxShadow: i === 0 ? '0 3px 0 #c2410c' : '0 3px 0 #a07040',
            position: 'relative',
          }}>
            {i === 0 && <div style={{ position:'absolute', top:-6, right:-4, fontSize:14 }}>👑</div>}
            <div style={{ fontSize:22, marginBottom:4 }}>{s.profiles?.avatar_emoji || '⚔️'}</div>
            <div style={{ fontSize:10, fontWeight:900, color:'#3a1000', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.profiles?.display_name || '—'}</div>
            <div style={{ fontSize:22, fontWeight:900, color: i === 0 ? '#c2410c' : '#8a6030', lineHeight:1 }}>{s.current_streak}</div>
            <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', color:'#8a6030' }}>dias</div>
          </div>
        ))}
      </div>

      {/* RECOMPENSAS */}
      {sectionHdr('🎁 Recompensas')}
      <div style={{ background:'linear-gradient(180deg,#f5ead8,#e8d8b8)', border:'2px solid #c8a870', borderRadius:14, padding:'14px 16px', marginBottom:10, boxShadow:'0 3px 0 #a07040' }}>
        {REWARDS.map(r => {
          const done = myStreak >= r.days
          const active = myStreak < r.days && myStreak >= (REWARDS[REWARDS.indexOf(r)-1]?.days || 0)
          return (
            <div key={r.days} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid rgba(160,112,64,0.2)' }}>
              <div style={{ fontSize:20, flexShrink:0 }}>{done ? '✅' : active ? '⭐' : '🔒'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:900, color: done ? '#15803d' : active ? '#c8960c' : '#5a4020' }}>{r.days} dias — {r.label}</div>
                <div style={{ fontSize:10, fontWeight:700, color:'#8a6030', marginTop:1 }}>{r.desc}</div>
              </div>
              <div style={{ fontSize:10, fontWeight:900, color: done ? '#15803d' : active ? '#c8960c' : '#8a6030', flexShrink:0 }}>
                {done ? '✓ Feito' : `${r.days - myStreak} dias`}
              </div>
            </div>
          )
        })}
      </div>

      {/* CONQUISTAS */}
      {sectionHdr('🏅 Conquistas')}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {ACHIEVEMENTS.map(a => {
          const unlocked = myStreak >= a.req
          return (
            <div key={a.id} style={{
              background: unlocked ? 'linear-gradient(180deg,#fff8d0,#f5e070)' : 'linear-gradient(180deg,#e8d8b8,#d8c8a0)',
              border: `2px solid ${unlocked ? '#c8960c' : '#b09060'}`,
              borderRadius:14, padding:'14px 12px',
              display:'flex', flexDirection:'column', alignItems:'center',
              textAlign:'center', gap:6,
              boxShadow: unlocked ? '0 3px 0 #805800' : '0 3px 0 #907040',
              opacity: unlocked ? 1 : 0.55,
            }}>
              <div style={{ fontSize:32 }}>{a.icon}</div>
              <div style={{ fontSize:10, fontWeight:900, color: unlocked ? '#3a1000' : '#5a4020', lineHeight:1.3 }}>{a.name}</div>
              <div style={{ fontSize:9, fontWeight:700, color:'#8a6030', lineHeight:1.4 }}>{a.desc}</div>
              <div style={{ fontSize:8, fontWeight:900, color: unlocked ? '#805800' : '#8a6030', background: unlocked ? 'rgba(200,150,0,0.15)' : 'rgba(0,0,0,0.06)', border: `1px solid ${unlocked ? 'rgba(200,150,0,0.3)' : 'transparent'}`, borderRadius:20, padding:'2px 8px' }}>
                {unlocked ? '✦ Desbloqueado' : `🔒 ${a.req} dias`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}