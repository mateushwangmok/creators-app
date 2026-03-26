import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Logo, Btn, Input, Divider, Card, ErrorMessage } from '../components/ui/index'
import { C } from '../styles/tokens'

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [forgot, setForgot]   = useState(false)

  const handleLogin = async () => {
    setError('')
    if (!email || !pass) { setError('Preencha e-mail e senha.'); return }
    setLoading(true)
    const { error: err } = await signIn(email, pass)
    if (err) {
      setError(err.message.includes('Invalid') ? 'E-mail ou senha incorretos.' : err.message)
    }
    setLoading(false)
  }

  if (forgot) return (
    <div className="screen">
      <div className="body-scroll">
        <button type="button" onClick={() => setForgot(false)} style={{ background:'transparent', border:'none', color:C.limen, fontSize:13, fontWeight:600, cursor:'pointer', padding:0, marginBottom:20 }}>← Voltar</button>
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:C.text }}>Recuperar acesso</div>
          <p style={{ color:C.iceS, fontSize:13, marginTop:7, lineHeight:1.6 }}>Informe seu e-mail para receber um link de redefinição.</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <Input label="E-mail" value={email} onChange={setEmail} placeholder="seu@email.com" type="email" />
          <Btn full onClick={() => { alert('Em produção, o link seria enviado ao e-mail.'); setForgot(false) }}>Enviar link</Btn>
          <Btn full variant="outline" onClick={() => setForgot(false)}>Voltar</Btn>
        </div>
      </div>
    </div>
  )

  return (
    <div className="screen">
      <div className="body-scroll">
        <div style={{ textAlign:'center', paddingTop:36, marginBottom:32 }} className="fu">
          <Logo />
          <div style={{ color:C.iceS, fontSize:12, marginTop:10 }}>Bem-vindo de volta</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }} className="fu2">
          <Input label="E-mail" value={email} onChange={setEmail} placeholder="seu@email.com" type="email" />
          <Input label="Senha" value={pass} onChange={setPass} placeholder="••••••••" type="password" />
          <button type="button" onClick={() => setForgot(true)} style={{ background:'transparent', border:'none', color:C.limen, fontSize:12, cursor:'pointer', textAlign:'right', padding:0, fontFamily:"'Outfit',sans-serif" }}>
            Esqueci minha senha
          </button>
          <ErrorMessage msg={error} />
          <Btn full onClick={handleLogin} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Btn>
          <Divider />
          <div style={{ textAlign:'center' }}>
            <span style={{ color:C.iceS, fontSize:13 }}>Primeira vez? </span>
            <Link to="/cadastro" style={{ color:C.limen, fontSize:13, fontWeight:600 }}>Criar conta</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
