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
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { router.push('/login'); return }

            // Pega membros da API
            const res = await fetch(`${process.env.NEXT_PUBLIC_PROXY_URL}/clan/members`)
            const data = await res.json()
            setMembers(data.items || [])

            // Pega tags já vinculadas
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

    if (loading) return <LoadingScreen />

    return (
        <div style={{ background: '#080A0F', minHeight: '100dvh', fontFamily: "'DM Sans', sans-serif", color: '#F0EAD6', display: 'flex', flexDirection: 'column' }}>

            {/* HEADER */}
            <div style={{ padding: '48px 20px 20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>Quem é você no clã?</div>
                <div style={{ fontSize: 12, color: 'rgba(240,234,214,0.5)', lineHeight: 1.6 }}>Selecione seu jogador na lista. Membros em cinza já estão vinculados a outra conta.</div>
            </div>
            {/* BOTÃO FECHAR */}
            <div style={{ position: 'absolute', top: 48, right: 20 }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, color: 'rgba(240,234,214,0.5)', cursor: 'pointer'
                    }}
                >✕</button>
            </div>
            {/* MULTI TOGGLE */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setMultiMode(!multiMode)}>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: multiMode ? 'rgba(200,151,58,0.3)' : 'rgba(255,255,255,0.07)', border: `1px solid ${multiMode ? '#C8973A' : 'rgba(255,255,255,0.07)'}`, position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: 2, left: multiMode ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: multiMode ? '#E8B84B' : 'rgba(240,234,214,0.4)', transition: 'all 0.2s' }} />
                </div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Tenho mais de uma conta no clã</div>
                    <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)' }}>Selecione múltiplos jogadores</div>
                </div>
            </div>

            {/* LISTA */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 120px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {members.map(m => {
                        const taken = takenTags.has(m.tag)
                        const sel = selected.has(m.tag)
                        return (
                            <div key={m.tag} onClick={() => toggleMember(m.tag)} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                background: sel ? 'rgba(200,151,58,0.07)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${sel ? '#C8973A' : taken ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
                                borderRadius: 13, padding: '11px 13px',
                                cursor: taken ? 'not-allowed' : 'pointer',
                                opacity: taken ? 0.35 : 1,
                                filter: taken ? 'grayscale(0.6)' : 'none',
                                transition: 'all 0.15s'
                            }}>
                                <div style={{ width: 40, height: 40, borderRadius: 9, background: 'linear-gradient(135deg,#1a2a4a,#2a1a4a)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⚔️</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#F0EAD6' }}>{m.name}</div>
                                    <div style={{ fontSize: 10, color: 'rgba(240,234,214,0.4)', fontWeight: 500 }}>{roleLabel(m.role)}</div>
                                    <div style={{ fontSize: 9, color: 'rgba(240,234,214,0.3)' }}>{m.tag}</div>
                                </div>
                                {taken && <div style={{ fontSize: 9, fontWeight: 700, color: '#2ECC71', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>Já no app 🎉</div>}
                                {sel && <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#C8973A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#080A0F', flexShrink: 0 }}>✓</div>}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* FOOTER */}
            <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '14px 16px 90px', background: 'linear-gradient(0deg,#080A0F 60%,transparent)' }}>
                <button
                    onClick={confirm}
                    disabled={selected.size === 0 || saving}
                    style={{
                        width: '100%', background: selected.size > 0 ? 'linear-gradient(135deg,#C8973A,#E8B84B)' : 'rgba(255,255,255,0.07)',
                        border: 'none', borderRadius: 12, padding: 14,
                        fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 600, letterSpacing: 2,
                        color: selected.size > 0 ? '#080A0F' : 'rgba(240,234,214,0.3)',
                        cursor: selected.size > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                    }}
                >
                    {saving ? 'Salvando...' : 'CONFIRMAR IDENTIDADE'}
                </button>
            </div>
        </div>
    )
}