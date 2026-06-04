'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'
import PullToRefresh from '@/components/PullToRefresh'

interface StreakUser {
  user_id: string
  current_streak: number
  last_checkin: string
  profiles: { display_name: string; avatar_emoji: string }
}

const ACHIEVEMENTS = [
  { id: 'founder',   icon: '🌱', name: 'Tava aqui quando tudo era mato...', desc: 'Entrou no app no dia da fundação — só os OGs têm essa.' },
  { id: 'day7',      icon: '🔥', name: 'Tá pegando fogo, bicho!',            desc: '7 dias consecutivos de check-in.' },
  { id: 'day14',     icon: '🏆', name: 'Bicho véio',                          desc: '14 dias consecutivos. Você já é mobília aqui.' },
  { id: 'day30',     icon: '🔱', name: 'Lenda do Clã',                        desc: '30 dias seguidos. Respeito.' },
  { id: 'day45',     icon: '🥇', name: 'Sócio',                               desc: '45 dias consecutivos. Você praticamente paga aluguel aqui.' },
  { id: 'day60',     icon: '💀', name: 'Já acabou, Jéssica?',                 desc: '60 dias seguidos. Isso não é streak, isso é vício.' },
  { id: 'forum10',   icon: '📝', name: 'Furumeiro',                           desc: '10 posts publicados no fórum. Voz ativa do clã.' },
  { id: 'vampire',   icon: '🧛', name: 'Vampiro Doido',                       desc: 'Acessou o app entre meia-noite e 5h da manhã. Dorme, mano.' },
  { id: 'historian', icon: '📜', name: 'Achou!',                              desc: 'Descobriu algo escondido no app. Olhos atentos.' },
  { id: 'secret',    icon: '❓', name: '????',                                desc: '!!!!' },
]

const REWARDS = [
  { days: 3,  label: '+15 pts bônus',    desc: 'Primeiros passos' },
  { days: 7,  label: '+40 pts bônus',    desc: 'Uma semana inteira!' },
  { days: 14, label: 'Título especial',  desc: 'Dedicação total' },
  { days: 30, label: 'Voto em promoção', desc: 'Lenda do clã' },
]

function effectiveStreak(s: StreakUser): number {
  const today = new Date().toLocaleDateString('en-CA')
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toLocaleDateString('en-CA')
  if (s.last_checkin === today || s.last_checkin === yesterdayStr) return s.current_streak
  return 0
}

export default function StreakPage() {
  const [myStreak, setMyStreak] = useState(0)
  const [allStreaks, setAllStreaks] = useState<StreakUser[]>([])
  const [loading, setLoading] = useState(true)
  const [checkedIn, setCheckedIn] = useState(false)
  const [isFounder, setIsFounder] = useState(false)
  const [forumPostCount, setForumPostCount] = useState(0)
  const [isVampire, setIsVampire] = useState(false)
  const [foundHistory, setFoundHistory] = useState(false)
  const [foundFlag, setFoundFlag] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [secretTaps, setSecretTaps] = useState(0)
  const [secretUnlocked, setSecretUnlocked] = useState(
    typeof window !== 'undefined' && localStorage.getItem('brb_secret_unlocked') === 'true'
  )
  const router = useRouter()
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const createdDate = user.created_at?.slice(0, 10)
    setIsFounder(createdDate === '2026-05-31')

    const hour = new Date().getHours()
    setIsVampire(hour >= 0 && hour < 5)

    setFoundHistory(typeof window !== 'undefined' && localStorage.getItem('found_history') === 'true')
    setFoundFlag(typeof window !== 'undefined' && localStorage.getItem('found_flag') === 'true')

    const [streakRes, allRes, forumRes] = await Promise.all([
      supabase.from('streaks').select('current_streak, last_checkin').eq('user_id', user.id).single(),
      supabase.from('streaks').select('user_id, current_streak, last_checkin, profiles(display_name, avatar_emoji)').order('current_streak', { ascending: false }).limit(9),
      supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    if (streakRes.data) {
      setMyStreak(streakRes.data.current_streak)
      const today = new Date().toLocaleDateString('en-CA')
      setCheckedIn(streakRes.data.last_checkin === today)
    }
    if (allRes.data) setAllStreaks(allRes.data as any)
    if (forumRes.count !== null) setForumPostCount(forumRes.count)

    // Marca todas as conquistas atualmente desbloqueadas como vistas e limpa o badge
    if (typeof window !== 'undefined') {
      const seen: string[] = JSON.parse(localStorage.getItem('brb_seen_ach') || '[]')
      const nowUnlocked: string[] = []
      if (createdDate === '2026-05-31') nowUnlocked.push('founder')
      if (streakRes.data?.current_streak >= 7)  nowUnlocked.push('day7')
      if (streakRes.data?.current_streak >= 14) nowUnlocked.push('day14')
      if (streakRes.data?.current_streak >= 30) nowUnlocked.push('day30')
      if (streakRes.data?.current_streak >= 45) nowUnlocked.push('day45')
      if (streakRes.data?.current_streak >= 60) nowUnlocked.push('day60')
      if ((forumRes.count ?? 0) >= 10) nowUnlocked.push('forum10')
      if (hour >= 0 && hour < 5) nowUnlocked.push('vampire')
      if (localStorage.getItem('found_history') === 'true' || localStorage.getItem('found_flag') === 'true') nowUnlocked.push('historian')
      if (localStorage.getItem('brb_secret_unlocked') === 'true') nowUnlocked.push('secret')
      const merged = [...new Set([...seen, ...nowUnlocked])]
      localStorage.setItem('brb_seen_ach', JSON.stringify(merged))
      localStorage.setItem('brb_ach_badge', '0')
      window.dispatchEvent(new Event('achievement-badge-update'))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('page-refresh', load)
    return () => window.removeEventListener('page-refresh', load)
  }, [load])

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

  function isUnlocked(id: string): boolean {
    switch (id) {
      case 'founder':   return isFounder
      case 'day7':      return myStreak >= 7
      case 'day14':     return myStreak >= 14
      case 'day30':     return myStreak >= 30
      case 'day45':     return myStreak >= 45
      case 'day60':     return myStreak >= 60
      case 'forum10':   return forumPostCount >= 10
      case 'vampire':   return isVampire
      case 'historian': return foundHistory || foundFlag
      case 'secret':    return secretUnlocked
      default:          return false
    }
  }

  const sectionHdr = (title: string) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, margin:'4px 0 8px' }}>
      <div style={{ fontSize:12, fontWeight:900, color:'#fff', textTransform:'uppercase', letterSpacing:'0.5px', textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>{title}</div>
      <div style={{ flex:1, height:2, background:'linear-gradient(90deg,#c8960c,transparent)', borderRadius:1 }} />
    </div>
  )

  if (loading) return <LoadingScreen />

  return (
    <PullToRefresh onRefresh={load}>
      <div style={{ padding:'10px 10px 20px' }}>

        {/* MEU STREAK */}
        <div style={{ background:'linear-gradient(135deg,#7c2d12,#c2410c)', border:'2px solid #f97316', borderRadius:14, padding:16, marginBottom:10, display:'flex', alignItems:'center', gap:14, boxShadow:'0 4px 0 #5a1a08' }}>
          <div style={{ fontSize:52 }}>🔥</div>
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

        {sectionHdr('🔥 Sequências do Clã')}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
          {allStreaks.map((s, i) => {
            const eff = effectiveStreak(s)
            return (
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
                <div style={{ fontSize:22, fontWeight:900, color: eff === 0 ? '#aaa' : i === 0 ? '#c2410c' : '#8a6030', lineHeight:1 }}>{eff}</div>
                <div style={{ fontSize:8, fontWeight:800, textTransform:'uppercase', color:'#8a6030' }}>{eff === 0 ? 'zerado' : 'dias'}</div>
              </div>
            )
          })}
        </div>

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

        {sectionHdr('🏅 Conquistas')}
        <div style={{ background:'linear-gradient(180deg,#f5ead8,#e8d8b8)', border:'2px solid #c8a870', borderRadius:14, overflow:'hidden', boxShadow:'0 3px 0 #a07040' }}>
          {ACHIEVEMENTS.map((a, i) => {
            const unlocked = isUnlocked(a.id)
            const expanded = expandedId === a.id
            return (
              <div key={a.id}>
                <div
                  onClick={() => {
                    if (a.id === 'secret' && !secretUnlocked) {
                      const next = secretTaps + 1
                      setSecretTaps(next)
                      if (next >= 14) {
                      setSecretUnlocked(true)
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('brb_secret_unlocked', 'true')
                      }
                    }
                      return
                    }
                    setExpandedId(expanded ? null : a.id)
                  }}
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'12px 16px',
                    borderBottom: expanded || i === ACHIEVEMENTS.length - 1 ? 'none' : '1px solid rgba(160,112,64,0.2)',
                    cursor:'pointer',
                    opacity: unlocked ? 1 : 0.45,
                    background: expanded ? 'rgba(200,150,12,0.08)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ fontSize:26, flexShrink:0, width:32, textAlign:'center' }}>{unlocked ? a.icon : '🔒'}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:900, color: unlocked ? '#1a0800' : '#5a4020', lineHeight:1.3 }}>{a.name}</div>
                  </div>
                  {unlocked && (
                    <div style={{ fontSize:9, fontWeight:900, color:'#805800', background:'rgba(200,150,0,0.15)', border:'1px solid rgba(200,150,0,0.3)', borderRadius:20, padding:'2px 8px', flexShrink:0, whiteSpace:'nowrap' }}>
                      ✦ Obtida
                    </div>
                  )}
                  <div style={{ fontSize:10, color:'#a07040', flexShrink:0, marginLeft:4 }}>{expanded ? '▲' : '▼'}</div>
                </div>
                {expanded && (
                  <div style={{ padding:'8px 16px 12px 60px', borderBottom: i < ACHIEVEMENTS.length - 1 ? '1px solid rgba(160,112,64,0.2)' : 'none', background:'rgba(200,150,12,0.06)' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#7a5020', lineHeight:1.5 }}>{a.desc}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </PullToRefresh>
  )
}
