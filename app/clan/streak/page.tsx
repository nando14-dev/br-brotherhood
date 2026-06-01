'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

interface StreakUser {
  user_id: string
  current_streak: number
  last_checkin: string
  profiles: {
    display_name: string
    avatar_emoji: string
  }
}

const ACHIEVEMENTS = [
  { id: 'day1', icon: '🌱', name: 'Estava aqui quando tudo era mato...', desc: 'Entrou no app no primeiro dia de publicação', req: 1 },
  { id: 'day7', icon: '🔥', name: 'TÁ PEGANDO FOGO, BICHO', desc: '7 dias seguidos no app', req: 7 },
  { id: 'day14', icon: '🏆', name: 'Veterano', desc: '14 dias seguidos no app', req: 14 },
  { id: 'day30', icon: '🔱', name: 'Lenda do Clã', desc: '30 dias seguidos no app', req: 30 },
]

const REWARDS = [
  { days: 3, label: '+15 pts bônus', desc: 'Primeiros passos' },
  { days: 7, label: '+40 pts bônus', desc: 'Uma semana inteira!' },
  { days: 14, label: 'Título especial', desc: 'Dedicação total' },
  { days: 30, label: 'Voto em promoção de cargo', desc: 'Lenda do clã' },
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

      // Meu streak
      const { data: myData } = await supabase
        .from('streaks')
        .select('current_streak, last_checkin')
        .eq('user_id', user.id)
        .single()

      if (myData) {
        setMyStreak(myData.current_streak)
        const today = new Date().toISOString().split('T')[0]
        setCheckedIn(myData.last_checkin === today)
      }

      // Todos os streaks do clã
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

    // Usa horário local do Brasil
    const now = new Date()
    const today = now.toLocaleDateString('en-CA') // formato YYYY-MM-DD

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toLocaleDateString('en-CA')

    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let newStreak = 1

    if (existing) {
      if (existing.last_checkin === yesterdayStr) {
        // Consecutivo — incrementa
        newStreak = existing.current_streak + 1
      } else if (existing.last_checkin === today) {
        // Já fez checkin hoje
        setCheckedIn(true)
        return
      }
      // Se não foi ontem nem hoje, reseta pra 1
      await supabase
        .from('streaks')
        .update({ current_streak: newStreak, last_checkin: today })
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('streaks')
        .insert({ user_id: user.id, current_streak: 1, last_checkin: today })
    }

    setMyStreak(newStreak)
    setCheckedIn(true)
  }

  if (loading) return <LoadingScreen />

  return (
    <div style={{ padding: '16px 16px 100px', fontFamily: "'DM Sans', sans-serif", color: '#F0EAD6' }}>

      {/* MEU STREAK */}
      <div style={{ background: 'linear-gradient(135deg, rgba(255,107,26,0.08), rgba(255,154,60,0.04))', border: '1px solid rgba(255,107,26,0.2)', borderRadius: 16, padding: 20, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 56, animation: 'fire-sway 2s ease infinite alternate' }}>🔥</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>Sua Sequência</div>
          <div style={{ fontSize: 12, color: 'rgba(240,234,214,0.5)', lineHeight: 1.5 }}>
            {checkedIn ? 'Check-in feito hoje! Volte amanhã.' : 'Faça check-in para manter sua sequência!'}
          </div>
          {!checkedIn && (
            <button onClick={doCheckin} style={{ marginTop: 10, background: 'linear-gradient(135deg,#FF6B1A,#FF9A3C)', border: 'none', borderRadius: 10, padding: '8px 16px', fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 600, letterSpacing: 1, color: '#fff', cursor: 'pointer' }}>
              🔥 FAZER CHECK-IN
            </button>
          )}
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 56, fontWeight: 900, color: '#FF9A3C', lineHeight: 1, textShadow: '0 0 24px rgba(255,107,26,0.4)' }}>{myStreak}</div>
      </div>

      {/* STREAKS DO CLÃ */}
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        Sequências do clã
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        {allStreaks.map((s, i) => (
          <div key={s.user_id} style={{
            background: i === 0 ? 'rgba(255,107,26,0.06)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${i === 0 ? 'rgba(255,107,26,0.25)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 12, padding: '12px 8px', textAlign: 'center', position: 'relative'
          }}>
            {i === 0 && <div style={{ position: 'absolute', top: -6, right: -4, fontSize: 14 }}>👑</div>}
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.profiles?.avatar_emoji || '⚔️'}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#F0EAD6', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.profiles?.display_name || '—'}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, color: i === 0 ? '#FF9A3C' : '#E8B84B', lineHeight: 1 }}>{s.current_streak}</div>
            <div style={{ fontSize: 8, color: 'rgba(240,234,214,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>dias</div>
          </div>
        ))}
      </div>

      {/* RECOMPENSAS */}
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        Recompensas
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
        {REWARDS.map(r => {
          const done = myStreak >= r.days
          const active = myStreak === r.days
          return (
            <div key={r.days} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 20, flexShrink: 0 }}>{done ? '✅' : active ? '⭐' : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: done ? '#2ECC71' : active ? '#E8B84B' : '#F0EAD6' }}>{r.days} dias — {r.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)', fontWeight: 400, marginTop: 1 }}>{r.desc}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: done ? '#2ECC71' : active ? '#E8B84B' : 'rgba(240,234,214,0.3)', flexShrink: 0 }}>
                {done ? '✓ Feito' : active ? 'Hoje!' : `${r.days - myStreak} dias`}
              </div>
            </div>
          )
        })}
      </div>

      {/* CONQUISTAS */}
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        Conquistas
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {ACHIEVEMENTS.map(a => {
          const unlocked = myStreak >= a.req
          return (
            <div key={a.id} style={{
              background: unlocked ? 'rgba(200,151,58,0.05)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${unlocked ? '#C8973A' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 14, padding: '14px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', gap: 6,
              opacity: unlocked ? 1 : 0.4, filter: unlocked ? 'none' : 'grayscale(0.5)'
            }}>
              <div style={{ fontSize: 32 }}>{a.icon}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: '#F0EAD6', lineHeight: 1.3 }}>{a.name}</div>
              <div style={{ fontSize: 9, color: 'rgba(240,234,214,0.4)', lineHeight: 1.4 }}>{a.desc}</div>
              <div style={{ fontSize: 8, fontWeight: 700, color: unlocked ? '#E8B84B' : 'rgba(240,234,214,0.3)', background: unlocked ? 'rgba(200,151,58,0.1)' : 'transparent', border: unlocked ? '1px solid rgba(200,151,58,0.2)' : 'none', borderRadius: 20, padding: '2px 8px' }}>
                {unlocked ? '✦ Desbloqueado' : `🔒 ${a.req} dias`}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`@keyframes fire-sway { from { transform: rotate(-4deg) scale(1); } to { transform: rotate(4deg) scale(1.05); } }`}</style>
    </div>
  )
}