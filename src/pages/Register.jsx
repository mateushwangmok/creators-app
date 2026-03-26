import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { generateShareCode, calcProfilePct } from '../lib/helpers'
import { Logo, Btn, Input, RadioGroup, ProgressBar, ErrorMessage } from '../components/ui/index'
import { C, GENDER_OPT } from '../styles/tokens'

const STEPS = ['Dados básicos', 'Gênero', 'Senha']

export default function Register() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    gender: '', genderOther: '',
    password: '', confirm: '',
  })
  const u = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    setError('')
    if (!form.password || form.password.length < 6) { setError('Senha deve ter mínimo 6 caracteres.'); return }
    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await signUp(form.email, form.password)
      if (authErr) throw new Error(authErr.message)
      if (!authData?.user) {
        setError('Verifique seu e-mail para confirmar o cadastro! 📬')
        setLoading(false)
        return
      }

      // 2. Create profile
      const initials = form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
      const { error: profErr } = await supabase.from('profiles').insert({
        id:          authData.user.id,
        role:        'creator',
        full_name:   form.name,
        email:       form.email,
        phone:       form.phone,
        gender:      form.gender,
        gender_other:form.genderOther || null,
        avatar:      initials,
        share_code:  generateShareCode(form.name),
        profile_pct: 10,
        status:      'pending',
      })
      if (profErr) throw new Error(profErr.message)

      navigate('/creator', { replace: true })
    } catch (err) {
      setError(err.message.includes('already registered') ? 'Este e-mail já está cadastrado.' : err.message)
    }
    setLoading(false)
  }

  return (
    <div className="screen">
      <div style={{ background:C.surf, padding:'14px 20px 0', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:11 }}>
          <Logo compact />
          <span style={{ color:C.textS, fontSize:11 }}>Passo {step+1} / {STEPS.length}</span>
        </div>
        <ProgressBar pct={Math.round(((step+1)/STEPS.length)*100)} />
        <div style={{ height:14 }} />
      </div>

      <div className="body-scroll">
        <div className="fu" key={step}>
          {step === 0 && (
            <>
              <div style={{ marginBottom:22 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:C.text }}>Criar conta</div>
                <div style={{ color:C.limen, fontSize:12, marginTop:4 }}>Bem-vindo à rede.</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <Input label="Nome completo" value={form.name} onChange={v=>u('name',v)} placeholder="Seu nome completo" required />
                <Input label="E-mail" value={form.email} onChange={v=>u('email',v)} placeholder="seu@email.com" type="email" required />
                <Input label="WhatsApp" value={form.phone} onChange={v=>u('phone',v)} placeholder="(11) 99999-9999" type="tel" required />
                <ErrorMessage msg={error} />
                <Btn full onClick={() => {
                  if (!form.name || !form.email || !form.phone) { setError('Preencha todos os campos.'); return }
                  setError(''); setStep(1)
                }}>Continuar →</Btn>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <button type="button" onClick={() => setStep(0)} style={{ background:'transparent', border:'none', color:C.limen, fontSize:13, fontWeight:600, cursor:'pointer', padding:0, marginBottom:20 }}>← Voltar</button>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:C.text }}>Gênero</div>
                <p style={{ color:C.iceS, fontSize:13, marginTop:8, lineHeight:1.6 }}>Esta informação é usada apenas para personalizar as oportunidades enviadas a você.</p>
              </div>
              <RadioGroup label="Como você se identifica? *" options={GENDER_OPT} value={form.gender} onChange={v=>u('gender',v)} />
              {form.gender === 'outro' && (
                <div style={{ marginTop:14 }}>
                  <Input label="Como prefere ser identificado?" value={form.genderOther} onChange={v=>u('genderOther',v)} placeholder="Escreva como preferir..." />
                </div>
              )}
              <ErrorMessage msg={error} />
              <Btn full onClick={() => { if (!form.gender) { setError('Selecione uma opção.'); return } setError(''); setStep(2) }} style={{ marginTop:20 }}>Continuar →</Btn>
            </>
          )}

          {step === 2 && (
            <>
              <button type="button" onClick={() => setStep(1)} style={{ background:'transparent', border:'none', color:C.limen, fontSize:13, fontWeight:600, cursor:'pointer', padding:0, marginBottom:20 }}>← Voltar</button>
              <div style={{ marginBottom:22 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:C.text }}>Criar senha</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <Input label="Senha" value={form.password} onChange={v=>u('password',v)} placeholder="Mínimo 6 caracteres" type="password" required />
                <Input label="Confirmar senha" value={form.confirm} onChange={v=>u('confirm',v)} placeholder="Repita a senha" type="password" required />
                <ErrorMessage msg={error} />
                <Btn full onClick={submit} disabled={loading}>{loading ? 'Criando conta...' : 'Criar minha conta'}</Btn>
                <div style={{ textAlign:'center' }}>
                  <span style={{ color:C.iceS, fontSize:13 }}>Já tenho conta — </span>
                  <Link to="/login" style={{ color:C.limen, fontSize:13, fontWeight:600 }}>Entrar</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
