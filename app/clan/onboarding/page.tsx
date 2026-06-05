'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/components/LoadingScreen'

export default function OnboardingPage() {
    const [members, setMembers] = useState<any[]>([])
    const [takenTags, setTakenTags] = useState<Set<string>>(new Set())
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [multiMode, setMultiMode] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_PROXY_URL}/clan/members`)
                const data = await res.json()
                setMembers(data.items || [])
            } catch {
                setError('Não foi possível carregar os membros. Tente novamente.')
            }

            const { data: links } = await supabase.from('player_links').select('player_tag')
            const tags = new Set((links || []).map((l: any) => l.player_tag))
            setTakenTags(tags)

            setLoading(false)
        }
        load()
    }, [])

    function toggleMember(tag: string) {
        if (takenTags.has(tag)) return
        const next = new Set(selected)
        if (!multiMode) next.clear()
        if (next.has(tag)) next.delete(tag)
        else next.add(tag)
        setSelected(next)
    }

    async function confirm() {
        if (selected.size === 0) return
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const toInsert = members
            .filter(m => selected.has(m.tag))
            .map(m => ({
                user_id: user.id,
                player_tag: m.tag,
                player_name: m.name,
                player_role: m.role
            }))

        await supabase.from('player_links').insert(toInsert)
        await supabase.from('profiles').update({ onboarded: true }).eq('id', user.id)

        router.push('/clan')
    }

    function roleLabel(role: string) {
        const map: Record<string, string> = { leader: '👑 Líder', coLeader: '🔱 Co-Líder', admin: '⚜️ Ancião', member: '🗡️ Membro' }
        return map[role] || role
    }

    function roleColors(role: string): { bg: string; color: string } {
        const map: Record<string, { bg: string; color: string }> = {
            leader:   { bg: '#FFDF00', color: '#3a1000' },
            coLeader: { bg: '#f97316', color: '#fff' },
            admin:    { bg: '#7a5020', color: '#fff' },
            member:   { bg: '#888',    color: '#fff' },
        }
        return map[role] || { bg: '#888', color: '#fff' }
    }

    if (loading) return <LoadingScreen />

    return (
        <div style={{ background: 'linear-gradient(180deg,#5a3a18 0%,#3d2510 100%)', minHeight: '100dvh', fontFamily: "'Nunito', sans-serif", color: '#f5ead8', display: 'flex', flexDirection: 'column' }}>

            {/* HEADER */}
            <div style={{ padding: '48px 20px 16px', textAlign: 'center', borderBottom: '3px solid #a07040', position: 'relative', background: 'linear-gradient(180deg,#4a2a0a,#3a1e06)', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                <button
                    onClick={() => router.push('/clan/perfil')}
                    style={{ position: 'absolute', top: 48, left: 16, width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '2px solid #a07040', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#c8a870', cursor: 'pointer' }}
                >✕</button>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#c8960c', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>Bem-vindo ao clã</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Quem é você no clã?</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,234,216,0.55)', lineHeight: 1.6 }}>Selecione seu jogador. Membros em cinza já estão vinculados.</div>
            </div>

            {/* MULTI TOGGLE */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(160,112,64,0.3)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', background: 'rgba(0,0,0,0.15)' }} onClick={() => setMultiMode(!multiMode)}>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: multiMode ? 'linear-gradient(180deg,#FFDF00,#c8960c)' : 'rgba(255,255,255,0.08)', border: `2px solid ${multiMode ? '#805800' : 'rgba(160,112,64,0.3)'}`, position: 'relative', transition: 'all 0.2s', flexShrink: 0, boxShadow: multiMode ? '0 2px 0 #805800' : 'none' }}>
                    <div style={{ position: 'absolute', top: 2, left: multiMode ? 18 : 2, width: 14, height: 14, borderRadius: '50%', background: multiMode ? '#3a1000' : 'rgba(245,234,216,0.4)', transition: 'all 0.2s' }} />
                </div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#f5ead8' }}>Tenho mais de uma conta no clã</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(245,234,216,0.5)' }}>Selecione múltiplos jogadores</div>
                </div>
            </div>

            {/* ERRO */}
            {error && (
                <div style={{ margin: '12px 16px', background: 'linear-gradient(180deg,#fff3e0,#ffe0b8)', border: '2px solid #f97316', borderRadius: 12, padding: '12px 14px', fontSize: 12, fontWeight: 900, color: '#7c2d12', textAlign: 'center', boxShadow: '0 3px 0 #c2410c' }}>{error}</div>
            )}

            {/* LISTA */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 120px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {members.map(m => {
                        const taken = takenTags.has(m.tag)
                        const sel = selected.has(m.tag)
                        const rc = roleColors(m.role)
                        return (
                            <div key={m.tag} onClick={() => toggleMember(m.tag)} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: sel ? 'linear-gradient(180deg,#fff8d0,#f5e070)' : 'linear-gradient(180deg,#f0e4cc,#e0d0a8)',
                                border: `2px solid ${sel ? '#c8960c' : taken ? 'rgba(160,112,64,0.3)' : '#c0a060'}`,
                                borderRadius: 12, padding: '10px 12px',
                                cursor: taken ? 'not-allowed' : 'pointer',
                                opacity: taken ? 0.4 : 1,
                                boxShadow: sel ? '0 3px 0 #805800' : '0 3px 0 #a07040',
                                transition: 'all 0.15s',
                            }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#5a2a08,#3a1000)', border: '2px solid #c8960c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 2px 0 #805800' }}>⚔️</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 900, color: sel ? '#5a2a00' : '#1a0800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                        <span style={{ fontSize: 8, fontWeight: 900, padding: '1px 5px', borderRadius: 5, textTransform: 'uppercase', background: rc.bg, color: rc.color }}>{roleLabel(m.role).split(' ')[1] || m.role}</span>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: '#8a6030' }}>{m.tag}</span>
                                    </div>
                                </div>
                                {taken && <div style={{ fontSize: 9, fontWeight: 900, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>No app ✓</div>}
                                {sel && <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(180deg,#FFDF00,#c8960c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#3a1000', flexShrink: 0, boxShadow: '0 2px 0 #805800' }}>✓</div>}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* FOOTER */}
            <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '14px 16px 40px', background: 'linear-gradient(0deg,#3d2510 60%,transparent)' }}>
                <button
                    onClick={confirm}
                    disabled={selected.size === 0 || saving}
                    style={{
                        width: '100%',
                        background: selected.size > 0 ? 'linear-gradient(180deg,#FFDF00,#c8960c)' : 'rgba(255,255,255,0.08)',
                        border: selected.size > 0 ? 'none' : '2px solid rgba(160,112,64,0.3)',
                        borderRadius: 12, padding: 14,
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 14, fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' as const,
                        color: selected.size > 0 ? '#3a1000' : 'rgba(245,234,216,0.3)',
                        cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                        boxShadow: selected.size > 0 ? '0 4px 0 #805800' : 'none',
                        transition: 'all 0.2s',
                    }}
                >
                    {saving ? 'Salvando...' : selected.size > 0 ? `Confirmar${selected.size > 1 ? ` (${selected.size})` : ''}` : 'Selecione seu jogador'}
                </button>
            </div>
        </div>
    )
}
