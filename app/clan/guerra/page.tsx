'use client'

import { useEffect, useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

interface WarData {
  state: string
  teamSize: number
  endTime: string
  startTime: string
  clan: {
    name: string
    stars: number
    destructionPercentage: number
    attacks: number
    members: WarMember[]
  }
  opponent: {
    name: string
    stars: number
    destructionPercentage: number
    attacks: number
  }
}

interface WarMember {
  name: string
  tag: string
  attacks?: { stars: number; destructionPercentage: number }[]
}

interface CWLGroup {
  state: string
  season: string
  clans: CWLClan[]
  rounds: { warTags: string[] }[]
}

interface CWLClan {
  name: string
  tag: string
  stars: number
  members: { name: string; tag: string; townhallLevel: number }[]
}

export default function GuerraPage() {
  const [mode, setMode] = useState<'loading' | 'regular' | 'cwl' | 'none'>('loading')
  const [war, setWar] = useState<WarData | null>(null)
  const [cwl, setCwl] = useState<CWLGroup | null>(null)
  const [cwlWar, setCwlWar] = useState<WarData | null>(null)
  const [nudged, setNudged] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const proxy = process.env.NEXT_PUBLIC_PROXY_URL

      // Tenta guerra regular primeiro
      const warRes = await fetch(`${proxy}/clan/currentwar`)
      const warData = await warRes.json()

      if (warData.state && warData.state !== 'notInWar') {
        setWar(warData)
        setMode('regular')
        return
      }

      // Tenta CWL
      try {
        const cwlRes = await fetch(`${proxy}/clan/cwl`)
        const cwlData = await cwlRes.json()

        if (cwlData.state && cwlData.clans) {
          setCwl(cwlData)

          // Pega a guerra atual da CWL (último round com war tags válidas)
          const rounds = cwlData.rounds || []
          for (let i = rounds.length - 1; i >= 0; i--) {
            const tags = rounds[i].warTags.filter((t: string) => t !== '#0')
            if (tags.length > 0) {
              // Encontra a war tag do nosso clã
              for (const tag of tags) {
                const encoded = tag.replace('#', '%23')
                const wRes = await fetch(`${proxy}/clan/cwl/war/${encoded}`)
                const wData = await wRes.json()
                if (wData.clan?.tag === '#P9P2RRG' || wData.opponent?.tag === '#P9P2RRG') {
                  // Normaliza pra sempre ter o clã como "clan"
                  if (wData.opponent?.tag === '#P9P2RRG') {
                    const tmp = wData.clan
                    wData.clan = wData.opponent
                    wData.opponent = tmp
                  }
                  setCwlWar(wData)
                  break
                }
              }
              break
            }
          }
          setMode('cwl')
          return
        }
      } catch (e) {
        console.error(e)
      }

      setMode('none')
    }
    load()
  }, [])

  function sendNudge(tag: string, name: string) {
    setNudged(prev => new Set([...prev, tag]))
  }

  function timeLeft(endTime: string) {
    const end = new Date(endTime.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6'))
    const diff = end.getTime() - Date.now()
    if (diff <= 0) return 'Encerrada'
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h}h ${m}min`
  }

  if (mode === 'loading') return <LoadingScreen />

  if (mode === 'none') return (
    <div style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(240,234,214,0.4)', fontFamily: 'Cinzel, serif' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
      <div>Nenhuma guerra em andamento</div>
    </div>
  )

  // ── CWL MODE ──
  if (mode === 'cwl') {
    const myClan = cwl?.clans.find(c => c.tag === '#P9P2RRG')
    const otherClans = cwl?.clans.filter(c => c.tag !== '#P9P2RRG') || []

    return (
      <div style={{ padding: '16px 16px 100px', fontFamily: "'DM Sans', sans-serif", color: '#F0EAD6' }}>

        {/* CWL HERO */}
        <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(79,70,229,0.06))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '3px 10px', fontSize: 9, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a78bfa', animation: 'pulse 1s infinite' }} />
            Liga de Guerra de Clãs
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Temporada {cwl?.season}</div>
          <div style={{ fontSize: 12, color: 'rgba(240,234,214,0.5)' }}>{cwl?.clans.length} clãs participando</div>
        </div>

        {/* GUERRA ATUAL DA CWL */}
        {cwlWar && cwlWar.state !== 'notInWar' && (
          <>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚔️ Batalha atual
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>🇧🇷 {cwlWar.clan.name}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 40, fontWeight: 900, color: '#E8B84B' }}>{cwlWar.clan.stars}⭐</div>
                </div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: 'rgba(240,234,214,0.3)', letterSpacing: 2 }}>VS</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>{cwlWar.opponent.name}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 40, fontWeight: 900, color: '#3a4a5a' }}>{cwlWar.opponent.stars}⭐</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)' }}>
                <span>{cwlWar.clan.attacks}/{cwlWar.teamSize} ataques</span>
                <span>⏱ {cwlWar.state === 'inWar' ? timeLeft(cwlWar.endTime) : cwlWar.state}</span>
                <span>{cwlWar.opponent.attacks}/{cwlWar.teamSize} ataques</span>
              </div>
            </div>

            {/* PENDENTES CWL */}
            {cwlWar.clan.members?.filter(m => !m.attacks || m.attacks.length === 0).length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚠️ Não atacaram
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {cwlWar.clan.members.filter(m => !m.attacks || m.attacks.length === 0).map(m => (
                    <div key={m.tag} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(231,76,60,0.04)', border: '1px solid rgba(231,76,60,0.15)', borderRadius: 12, padding: '10px 12px' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#1a2a4a,#2a1a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>⚔️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#E74C3C', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.18)', borderRadius: 6, padding: '1px 6px', display: 'inline-block', marginTop: 2 }}>⚠️ Não atacou</div>
                      </div>
                      <button onClick={() => sendNudge(m.tag, m.name)} style={{ background: nudged.has(m.tag) ? 'rgba(46,204,113,0.08)' : 'rgba(124,58,237,0.1)', border: `1px solid ${nudged.has(m.tag) ? 'rgba(46,204,113,0.25)' : 'rgba(124,58,237,0.25)'}`, borderRadius: 9, padding: '7px 10px', fontSize: 10, fontWeight: 700, color: nudged.has(m.tag) ? '#2ECC71' : '#a78bfa', cursor: nudged.has(m.tag) ? 'default' : 'pointer', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: 15 }}>{nudged.has(m.tag) ? '✅' : '👋'}</span>
                        <span>{nudged.has(m.tag) ? 'Enviado' : 'Cutucar'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* RANKING CWL */}
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          🏆 Classificação
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cwl?.clans.sort((a, b) => (b.stars || 0) - (a.stars || 0)).map((c, i) => (
            <div key={c.tag} style={{ display: 'flex', alignItems: 'center', gap: 10, background: c.tag === '#P9P2RRG' ? 'rgba(200,151,58,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${c.tag === '#P9P2RRG' ? '#C8973A' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: i < 3 ? '#E8B84B' : 'rgba(240,234,214,0.4)', width: 24, textAlign: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.name} {c.tag === '#P9P2RRG' ? '🇧🇷' : ''}</div>
                <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)' }}>{c.tag}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: '#E8B84B' }}>{c.stars || 0}⭐</div>
              </div>
            </div>
          ))}
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }`}</style>
      </div>
    )
  }

  // ── REGULAR WAR MODE ──
  const pending = war!.clan.members.filter(m => !m.attacks || m.attacks.length < 2)
  const attacked = war!.clan.members.filter(m => m.attacks && m.attacks.length > 0)
  const barWidth = Math.round((war!.clan.stars / Math.max(war!.clan.stars + war!.opponent.stars, 1)) * 100)

  return (
    <div style={{ padding: '16px 16px 100px', fontFamily: "'DM Sans', sans-serif", color: '#F0EAD6' }}>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 20, padding: '3px 10px', fontSize: 9, fontWeight: 700, color: '#E74C3C', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#E74C3C', animation: 'pulse 1s infinite' }} />
          {war!.state === 'inWar' ? 'AO VIVO' : war!.state === 'preparation' ? 'PREPARAÇÃO' : 'ENCERRADA'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>🇧🇷 {war!.clan.name}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 40, fontWeight: 900, color: '#E8B84B' }}>{war!.clan.stars}⭐</div>
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: 'rgba(240,234,214,0.3)', letterSpacing: 2 }}>VS</div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>{war!.opponent.name}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 40, fontWeight: 900, color: '#3a4a5a' }}>{war!.opponent.stars}⭐</div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, height: 5, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#C8973A,#FF6B1A)', borderRadius: 20, width: `${barWidth}%`, transition: 'width 1.5s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, color: 'rgba(240,234,214,0.4)' }}>
          <span>{war!.clan.attacks}/{war!.teamSize * 2} ataques</span>
          <span>⏱ {war!.state === 'inWar' ? timeLeft(war!.endTime) : '—'}</span>
          <span>{war!.opponent.attacks}/{war!.teamSize * 2} ataques</span>
        </div>
      </div>

      {pending.length > 0 && <>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ Ataques pendentes
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {pending.map(m => (
            <div key={m.tag} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(231,76,60,0.04)', border: '1px solid rgba(231,76,60,0.15)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#1a2a4a,#2a1a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>⚔️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#E74C3C', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.18)', borderRadius: 6, padding: '1px 6px', display: 'inline-block', marginTop: 2 }}>
                  ⚠️ {!m.attacks || m.attacks.length === 0 ? 'Não atacou' : '1 ataque restando'}
                </div>
              </div>
              <div style={{ textAlign: 'right', marginRight: 8 }}>
                <div style={{ fontSize: 13, color: m.attacks?.length ? '#E8B84B' : 'rgba(240,234,214,0.3)' }}>{m.attacks?.length ? '⭐'.repeat(m.attacks[0].stars) : '—'}</div>
                <div style={{ fontSize: 9, color: 'rgba(240,234,214,0.4)', fontWeight: 600 }}>{m.attacks?.length ? `${m.attacks[0].destructionPercentage.toFixed(0)}%` : '2 restantes'}</div>
              </div>
              <button onClick={() => sendNudge(m.tag, m.name)} style={{ background: nudged.has(m.tag) ? 'rgba(46,204,113,0.08)' : 'rgba(124,58,237,0.1)', border: `1px solid ${nudged.has(m.tag) ? 'rgba(46,204,113,0.25)' : 'rgba(124,58,237,0.25)'}`, borderRadius: 9, padding: '7px 10px', fontSize: 10, fontWeight: 700, color: nudged.has(m.tag) ? '#2ECC71' : '#a78bfa', cursor: 'pointer', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: 15 }}>{nudged.has(m.tag) ? '✅' : '👋'}</span>
                <span>{nudged.has(m.tag) ? 'Enviado' : 'Cutucar'}</span>
              </button>
            </div>
          ))}
        </div>
      </>}

      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(240,234,214,0.4)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        ✅ Ataques realizados
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,151,58,0.25),transparent)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {attacked.map(m => (
          <div key={m.tag} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#1a2a4a,#2a1a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>⚔️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)' }}>{m.attacks!.length}/2 ataques</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, color: '#E8B84B' }}>{'⭐'.repeat(Math.max(...m.attacks!.map(a => a.stars)))}</div>
              <div style={{ fontSize: 9, color: 'rgba(240,234,214,0.4)', fontWeight: 600 }}>{Math.max(...m.attacks!.map(a => a.destructionPercentage)).toFixed(0)}%</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.5)} }`}</style>
    </div>
  )
}