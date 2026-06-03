'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface ReleaseNote {
    version: string
    title: string
    items: { icon: string; text: string }[]
}

export default function ReleaseNotes({ forceOpen = false, onClose }: { forceOpen?: boolean; onClose?: () => void }) {
    const [note, setNote] = useState<ReleaseNote | null>(null)
    const [visible, setVisible] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        console.log('ReleaseNotes montado, forceOpen:', forceOpen)
        if (forceOpen) {
            loadLatest()
        } else {
            checkVersion()
        }
    }, [forceOpen])

    async function loadLatest() {
        const { data: latest } = await supabase
            .from('release_notes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        if (latest) {
            setNote(latest)
            setVisible(true)
        }
    }

    async function checkVersion() {
        console.log('checkVersion chamado')
        const { data: { user } } = await supabase.auth.getUser()
        console.log('user:', user?.id)
        if (!user) return

        const { data: profile } = await supabase
            .from('profiles')
            .select('last_seen_version')
            .eq('id', user.id)
            .single()
        console.log('profile:', profile)

        const { data: latest } = await supabase
            .from('release_notes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        console.log('latest:', latest)

        if (!latest) return

        if (profile?.last_seen_version !== latest.version) {
            setNote(latest)
            setVisible(true)
        }
    }

    async function dismiss() {
        setVisible(false)
        onClose?.()
        if (forceOpen) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !note) return
        await supabase
            .from('profiles')
            .update({ last_seen_version: note.version })
            .eq('id', user.id)
    }

    if (!visible || !note) return null

    return (
        <>
            <div onClick={dismiss} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

            <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, zIndex: 501, animation: 'slide-up-modal 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>
                <div style={{ background: 'linear-gradient(180deg,#f5ead8,#e8d8b8)', borderRadius: '20px 20px 0 0', border: '2px solid #c8a870', borderBottom: 'none', boxShadow: '0 -8px 32px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

                    <div style={{ background: 'linear-gradient(180deg,#2a1a08,#3d2510)', padding: '16px 20px 14px', borderBottom: '3px solid #c8960c', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#1a3060,#3a1060)', border: '2px solid #c8960c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, boxShadow: '0 3px 0 #805800' }}>🇧🇷</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, fontWeight: 900, color: '#c8960c', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 2 }}>✦ Novidades — v{note.version}</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>{note.title}</div>
                        </div>
                    </div>

                    <div style={{ padding: '14px 20px 6px' }}>
                        {note.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < note.items.length - 1 ? '1px solid rgba(160,112,64,0.2)' : 'none' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(180deg,#fff8e8,#f0e4cc)', border: '2px solid #c8a870', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: '0 2px 0 #a07040' }}>{item.icon}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#3a1000', lineHeight: 1.5, paddingTop: 8 }}>{item.text}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '12px 20px 32px' }}>
                        <button onClick={dismiss} style={{ width: '100%', background: 'linear-gradient(180deg,#FFDF00,#c8960c)', border: 'none', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 900, color: '#3a1000', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 0 #805800', fontFamily: "'Nunito', sans-serif" }}>
                            ENTENDIDO! ✦
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes slide-up-modal {
          from { transform: translateX(-50%) translateY(100%); }
          to   { transform: translateX(-50%) translateY(0); }
        }
      `}</style>
        </>
    )
}