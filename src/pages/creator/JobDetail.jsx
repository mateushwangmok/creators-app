import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getJobById, getMyInvites, updateInviteStatus } from '../../services/jobs'
import { BackBtn, Badge, StatusBadge, Card, Btn, SLabel, Divider, Toast, Modal } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C } from '../../styles/tokens'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState(false)
  const [toast, setToast]     = useState(null)
  const [modal, setModal]     = useState(null)

  useEffect(() => {
    const load = async () => {
      const invites = await getMyInvites(profile.id)
      const inv = invites.find(i => i.id === id)
      setInvite(inv)
      setLoading(false)
    }
    if (profile) load()
  }, [id, profile])

  const doAction = async (action) => {
    setActing(true)
    try {
      await updateInviteStatus(id, action === 'accept' ? 'accepted' : 'refused')
      setInvite(p => ({ ...p, status: action === 'accept' ? 'accepted' : 'refused' }))
      setToast({ msg: action === 'accept' ? 'Convite aceito! ✓' : 'Convite recusado.' })
    } catch (e) {
      setToast({ msg: e.message, type: 'error' })
    }
    setActing(false)
    setModal(null)
  }

  if (loading) return <div className="screen"><Spinner /></div>
  if (!invite) return <div className="screen"><div className="body-scroll"><BackBtn onClick={() => navigate('/creator')} /><p style={{ color:C.textS, marginTop:16 }}>Convite não encontrado.</p></div></div>

  const job = invite.job
  const answered = invite.status !== 'pending'

  return (
    <div className="screen">
      <div style={{ background:C.surf, padding:'13px 20px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <BackBtn onClick={() => navigate('/creator')} />
        <div style={{ display:'flex', gap:7, marginTop:9 }}>
          <Badge label="Convite Direto" color={C.violet} />
          <StatusBadge status={invite.status} />
        </div>
      </div>

      <div className="body-scroll">
        <div className="fu">
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:22, color:C.text, marginBottom:4, lineHeight:1.2 }}>{job?.title}</div>
          <div style={{ color:C.iceS, fontSize:13, marginBottom:16 }}>{job?.brand} · {job?.city}</div>

          {job?.value && (
            <Card style={{ marginBottom:14, background:`${C.ok}12`, borderColor:`${C.ok}28` }}>
              <div style={{ color:C.iceS, fontSize:10, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:3 }}>Valor oferecido</div>
              <div style={{ color:C.ok, fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:28 }}>
                R$ {Number(job.value).toLocaleString('pt-BR')}
              </div>
            </Card>
          )}

          {[['Descrição', job?.description], ['Cidade', job?.city], ['Prazo', job?.deadline], ['Observações', job?.observations || '—']].map(([k, v]) => (
            <div key={k} style={{ marginBottom:13 }}>
              <SLabel>{k}</SLabel>
              <div style={{ color:v === '—' ? C.textM : C.text, fontSize:14, lineHeight:1.6 }}>{v}</div>
            </div>
          ))}

          {job?.deliverables?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <SLabel>Entregas</SLabel>
              {job.deliverables.map((d, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0' }}>
                  <div style={{ width:4, height:4, borderRadius:'50%', background:C.limen, flexShrink:0 }} />
                  <span style={{ color:C.text, fontSize:13 }}>{d}</span>
                </div>
              ))}
            </div>
          )}

          {!answered && (
            <>
              <Divider />
              <div style={{ display:'flex', flexDirection:'column', gap:9, marginTop:14 }}>
                <Btn full variant="teal" onClick={() => setModal('accept')} disabled={acting}>Aceitar convite ✓</Btn>
                <Btn full variant="outline" onClick={() => setModal('refuse')} disabled={acting}>Recusar</Btn>
              </div>
            </>
          )}

          {answered && (
            <Card style={{ background:`${C.ok}10`, borderColor:`${C.ok}22`, marginTop:8 }}>
              <div style={{ color:C.ok, fontSize:13, fontWeight:600 }}>Você já respondeu este convite</div>
              <div style={{ color:C.textS, fontSize:12, marginTop:5, display:'flex', alignItems:'center', gap:7 }}>
                Status: <StatusBadge status={invite.status} />
              </div>
            </Card>
          )}
        </div>
      </div>

      {modal === 'accept' && (
        <Modal onClose={() => setModal(null)} title="Confirmar aceite?">
          <p style={{ color:C.iceS, fontSize:13, marginBottom:18 }}>Ao aceitar, confirma que está disponível para este job.</p>
          <div style={{ display:'flex', gap:9 }}>
            <Btn full variant="outline" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn full variant="teal" onClick={() => doAction('accept')} disabled={acting}>Aceitar</Btn>
          </div>
        </Modal>
      )}
      {modal === 'refuse' && (
        <Modal onClose={() => setModal(null)} title="Confirmar recusa?">
          <p style={{ color:C.iceS, fontSize:13, marginBottom:18 }}>Tem certeza que deseja recusar este convite?</p>
          <div style={{ display:'flex', gap:9 }}>
            <Btn full variant="outline" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn full variant="danger" onClick={() => doAction('refuse')} disabled={acting}>Recusar</Btn>
          </div>
        </Modal>
      )}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
