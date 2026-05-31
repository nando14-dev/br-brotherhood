'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import EmberBackground from '@/components/EmberBackground'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleLogin() {
    if (!email || !password) { showToast('⚠️ Preencha todos os campos'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { showToast('⚠️ ' + error.message); return }
    router.push('/')
  }

  async function handleRegister() {
    if (!email || !email.includes('@')) { showToast('⚠️ Email inválido'); return }
    if (password.length < 6) { showToast('⚠️ Senha com mínimo 6 caracteres'); return }
    if (password !== password2) { showToast('⚠️ As senhas não coincidem'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    setLoading(false)
    if (error) { showToast('⚠️ ' + error.message); return }
    setMode('verify')
  }

  async function handleForgot() {
    if (!email || !email.includes('@')) { showToast('⚠️ Email inválido'); return }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback`
    })
    setLoading(false)
    showToast('📧 Link enviado para seu email!')
    setTimeout(() => setMode('login'), 2000)
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#080A0F', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", color: '#F0EAD6',
      padding: '32px 24px'
    }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>

        {/* LOGIN */}
        {mode === 'login' && <>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🇧🇷</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 24, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>BR BROTHERHOOD</h1>
          <p style={{ fontSize: 11, color: 'rgba(240,234,214,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>#P9P2RRG · desde 2016</p>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={labelStyle}>E-mail</label><input style={inputStyle} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label style={labelStyle}>Senha</label><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <div style={{ textAlign: 'right' }}><span style={{ fontSize: 11, color: '#E8B84B', cursor: 'pointer' }} onClick={() => setMode('forgot')}>Esqueci a senha</span></div>
            <button style={btnPrimary} onClick={handleLogin} disabled={loading}>{loading ? 'Entrando...' : 'ENTRAR'}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={dividerLine}/><span style={{ fontSize: 11, color: 'rgba(240,234,214,0.4)' }}>novo por aqui?</span><div style={dividerLine}/></div>
            <button style={btnSecondary} onClick={() => setMode('register')}>Criar conta</button>
          </div>
        </>}
        <EmberBackground />
        {/* REGISTER */}
        {mode === 'register' && <>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚔️</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>CRIAR CONTA</h1>
          <p style={{ fontSize: 11, color: 'rgba(240,234,214,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 32 }}>Junte-se ao BR Brotherhood</p>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={labelStyle}>E-mail</label><input style={inputStyle} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label style={labelStyle}>Senha</label><input style={inputStyle} type="password" placeholder="mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} /></div>
            <div><label style={labelStyle}>Confirmar senha</label><input style={inputStyle} type="password" placeholder="repita a senha" value={password2} onChange={e => setPassword2(e.target.value)} /></div>
            <button style={btnPrimary} onClick={handleRegister} disabled={loading}>{loading ? 'Criando...' : 'CRIAR CONTA'}</button>
            <button style={btnSecondary} onClick={() => setMode('login')}>Já tenho conta</button>
          </div>
        </>}

        {/* VERIFY */}
        {mode === 'verify' && <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📬</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 700, letterSpacing: 2, marginBottom: 8, textAlign: 'center' }}>VERIFIQUE SEU EMAIL</h1>
          <p style={{ fontSize: 13, color: 'rgba(240,234,214,0.5)', lineHeight: 1.7, textAlign: 'center', marginBottom: 12 }}>
            Enviamos um link para<br/><span style={{ color: '#E8B84B', fontWeight: 700 }}>{email}</span>
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 20px', marginBottom: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'rgba(240,234,214,0.5)', lineHeight: 1.7 }}>Clique no link do email para ativar sua conta. Depois volte aqui e faça login normalmente.</p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={btnSecondary} onClick={() => setMode('login')}>Voltar ao login</button>
          </div>
        </>}

        {/* FORGOT */}
        {mode === 'forgot' && <>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>RECUPERAR ACESSO</h1>
          <p style={{ fontSize: 11, color: 'rgba(240,234,214,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 32 }}>Enviaremos um link para seu email</p>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={labelStyle}>E-mail cadastrado</label><input style={inputStyle} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <button style={btnPrimary} onClick={handleForgot} disabled={loading}>{loading ? 'Enviando...' : 'ENVIAR LINK'}</button>
            <button style={btnSecondary} onClick={() => setMode('login')}>Voltar ao login</button>
          </div>
        </>}

      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#0f1520', border: '1px solid rgba(200,151,58,0.3)', borderRadius: 20, padding: '10px 20px', fontSize: 12, fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(240,234,214,0.4)', marginBottom: 6, display: 'block' }
const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '13px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#F0EAD6', outline: 'none' }
const btnPrimary: React.CSSProperties = { width: '100%', background: 'linear-gradient(135deg, #C8973A, #E8B84B)', border: 'none', borderRadius: 12, padding: 14, fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 600, letterSpacing: 2, color: '#080A0F', cursor: 'pointer', marginTop: 4 }
const btnSecondary: React.CSSProperties = { width: '100%', background: 'transparent', border: '1px solid rgba(200,151,58,0.25)', borderRadius: 12, padding: 13, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#E8B84B', cursor: 'pointer' }
const dividerLine: React.CSSProperties = { flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }