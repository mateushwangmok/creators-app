import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getJobById, submitBid, getBidCount, getMyBids } from '../../services/jobs'
import { BackBtn, Badge, Card, Btn, SLabel, Divider, Input, Textarea, Toast } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C } from '../../styles/tokens'

export default function OpenJobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [job, setJob]         = useState(null)
  const [count, setCount]     = useState(0)
  const [myBid, setMyBid]     = useState(null)
  const [amount, setAmount]   = useState('')
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [toast, setToast]     = useState(null)

  useEffect(() => {
    const load = async () => {
      const [j, c, bids] = await Promise.all([
        getJobById(id),
        getBidCount(id),
        getMyBids(profile.id),
      ])
      setJob(j)
      setCount(c)
      setMyBid(bids.find(b => b.job_id === id) || null)
      setLoading(false)
    }
    if (profile) load()
  }, [id, profile])

  const sendBid = async () => {
    if (!amount) { setToast({ msg:'Informe um valor.', type:'error' }); return }
    setSending(true)
    try {
      const bid = await submitBid(id, profile.id, parseFloat(amount), note)
      setMyBid(bid)
      setCount(c => c + 1)
      setToast({ msg:'Proposta enviada com sucesso!' })
    } catch (e) {
      setToast({ msg: e.message.includes('unique') ? 'Você já enviou proposta para este job.' : e.message, type:'error' })
    }
    setSending(false)
  }

  if (loading) return <div className="screen"><Spinner /></div>
  if (!job) return <div className="screen"><div className="body-scroll"><BackBtn onClick={() => navigate('/creator')} /><p style={{ color:C.textS, marginTop:16 }}>Job não encontrado.</p></div></div>

  return (
    <div className="screen">
      <div style={{ background:C.surf, padding:'13px 20px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <BackBtn onClick={() => navigate('/creator')} />
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:9 }}>
          <Badge label="Job Aberto" color={C.teal} />
          <span style={{ background:`${C.teal}18`, border:`1px solid ${C.teal}28`, borderRadius:16, padding:'3px 10px', fontSize:11, color:C.teal, fontWeight:600 }}>
            {count} proposta{count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="body-scroll">
        <div className="fu">
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:C.text, marginBottom:4, lineHeight:1.2 }}>{job.title}</div>
          <div style={{ color:C.iceS, fontSize:13, marginBottom:16 }}>{job.brand} · {job.city}</div>

          {/* Confidentiality notice */}
          <Card style={{ background:`${C.limen}08`, borderColor:`${C.limen}20`, marginBottom:16 }}>
            <div style={{ display:'flex', gap:9, alignItems:'flex-start' }}>
              <div style={{ width:17, height:17, borderRadius:5, background:C.limen, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#001621', fontWeight:800, flexShrink:0 }}>🔒</div>
              <div style={{ color:C.iceS, fontSize:13, lineHeight:1.55 }}>
                <strong style={{ color:C.limen }}>Proposta confidencial.</strong>{' '}
                Suas propostas são privadas. Ninguém além de Mateus Hwangmok poderá ver os seus valores.
              </div>
            </div>
          </Card>

          {[['Descrição', job.description], ['Cidade', job.city], ['Prazo', job.deadline], ['Observações', job.observations || '—']].map(([k, v]) => (
            <div key={k} style={{ marginBottom:13 }}>
              <SLabel>{k}</SLabel>
              <div style={{ color:v === '—' ? C.textM : C.text, fontSize:14, lineHeight:1.6 }}>{v}</div>
            </div>
          ))}

          {job.deliverables?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <SLabel>Entregas</SLabel>
              {job.deliverables.map((d, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0' }}>
                  <div style={{ width:4, height:4, borderRadius:'50%', background:C.teal, flexShrink:0 }} />
                  <span style={{ color:C.text, fontSize:13 }}>{d}</span>
                </div>
              ))}
            </div>
          )}

          <Divider />

          {myBid ? (
            <Card style={{ background:`${C.ok}10`, borderColor:`${C.ok}25`, marginTop:14 }}>
              <div style={{ color:C.ok, fontWeight:700, fontSize:13, marginBottom:7 }}>Proposta enviada ✓</div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ color:C.iceS, fontSize:12 }}>Valor enviado</span>
                <span style={{ color:C.ok, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17 }}>
                  R$ {Number(myBid.amount).toLocaleString('pt-BR', { minimumFractionDigits:2 })}
                </span>
              </div>
              {myBid.note && <div style={{ color:C.iceS, fontSize:12, marginTop:9, borderTop:`1px solid ${C.border}`, paddingTop:9 }}>"{myBid.note}"</div>}
            </Card>
          ) : (
            <div style={{ marginTop:14 }}>
              <SLabel>Enviar proposta</SLabel>
              <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                <Input label="Valor (R$)" value={amount} onChange={setAmount} placeholder="Ex: 2500" type="number" />
                <Textarea label="Mensagem (opcional)" value={note} onChange={setNote} placeholder="Apresente-se e explique por que você é a escolha ideal..." />
                <Btn full onClick={sendBid} disabled={!amount || sending}>
                  {sending ? 'Enviando...' : 'Enviar Proposta'}
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
