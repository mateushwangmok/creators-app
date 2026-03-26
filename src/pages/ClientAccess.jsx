import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo, Btn, Input, ErrorMessage } from '../components/ui/index'
import { C } from '../styles/tokens'

export default function ClientAccess() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const go = () => {
    if (!name || !code) { setError('Preencha seu nome e o código recebido.'); return }
    navigate(`/perfil/${code.toUpperCase()}?nome=${encodeURIComponent(name)}`)
  }

  return (
    <div className="screen">
      <div className="body-scroll">
        <button type="button" onClick={() => navigate('/')} style={{ background:'transparent', border:'none', color:C.limen, fontSize:13, fontWeight:600, cursor:'pointer', padding:0, marginBottom:20 }}>← Voltar</button>
        <div style={{ marginBottom:28 }}>
          <Logo />
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:C.text, marginTop:18 }}>Acesso ao perfil</div>
          <p style={{ color:C.iceS, fontSize:13, marginTop:8, lineHeight:1.6 }}>
            Digite seu nome e o código recebido para visualizar o perfil da creator.
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <Input label="Seu nome" value={name} onChange={setName} placeholder="Nome do cliente" required />
          <Input label="Código de acesso" value={code} onChange={setCode} placeholder="Ex: ANA2B4" required />
          <ErrorMessage msg={error} />
          <Btn full onClick={go}>Acessar perfil</Btn>
        </div>
        <p style={{ color:C.textM, fontSize:11, textAlign:'center', marginTop:24, lineHeight:1.7 }}>
          Acesso válido por tempo limitado.<br />Compartilhado por Mateus Hwangmok.
        </p>
      </div>
    </div>
  )
}
