import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getCreatorById, getPhotos, getVideoLinks, createShareLink } from '../../services/profiles'
import { createJob, createInvite } from '../../services/jobs'
import { PageHeader, Avatar, Badge, Card, ProgressBar, StatusBadge, SLabel, Btn, Input, Textarea, SelectField, Modal, Toast } from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C, NICHES, isFeminineProfile } from '../../styles/tokens'

export default function AdminCreatorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile: adminProfile } = useAuth()
  const [creator, setCreator] = useState(null)
  const [photos, setPhotos]   = useState([])
  const [videos, setVideos]   = useState([])
  const [tab, setTab]         = useState('data')
  const [modal, setModal]     = useState(null)
  const [shareInfo, setShareInfo] = useState(null)
  const [toast, setToast]     = useState(null)
  const [saving, setSaving]   = useState(false)
  const [form, setForm] = useState({ title:'', brand:'', description:'', deliverables:'', city:'', deadline:'', value:'', observations:'' })
  const u = (k,v) => setForm(f => ({ ...f, [k]:v }))

  useEffect(() => {
    const load = async () => {
      const [c, p, v] = await Promise.all([getCreatorById(id), getPhotos(id), getVideoLinks(id)])
      setCreator(c); setPhotos(p); setVideos(v)
    }
    load()
  }, [id])

  const handleSendInvite = async () => {
    if (!form.title || !form.brand) { setToast({ msg:'Preencha título e marca.', type:'error' }); return }
    setSaving(true)
    try {
      const job = await createJob({
        type: 'direct',
        title: form.title,
        brand: form.brand,
        description: form.description,
        deliverables: form.deliverables.split(',').map(s=>s.trim()).filter(Boolean),
        city: form.city,
        deadline: form.deadline || null,
        value: form.value ? parseFloat(form.value) : null,
        observations: form.observations,
        status: 'open',
        created_by: adminProfile.id,
      })
      await createInvite(job.id, id)
      setToast({ msg:'Convite direto enviado! ✓' })
      setModal(null)
    } catch (e) { setToast({ msg: e.message, type:'error' }) }
    setSaving(false)
  }

  const handleShare = async () => {
    setSaving(true)
    try {
      const s = await createShareLink(id, adminProfile.id)
      setShareInfo(s)
      setModal('share_result')
    } catch (e) { setToast({ msg: e.message, type:'error' }) }
    setSaving(false)
  }

  if (!creator) return <div className="screen"><Spinner /></div>

  const facePhotos = photos.filter(p => p.photo_type === 'face')
  const bodyPhotos = photos.filter(p => p.photo_type === 'body')
  const showExtra  = isFeminineProfile(creator.gender, creator.gender_other)
  const gLabel     = creator.gender === 'outro' && creator.gender_other ? `Outro: ${creator.gender_other}` : creator.gender || '—'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }} className="screen">
      <div style={{ background:C.surf, padding:'13px 20px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <PageHeader title={creator.full_name} onBack={() => navigate('/admin/creators')} />
        <div style={{ display:'flex', alignItems:'center', gap:11, marginTop:10 }}>
          <Avatar name={creator.full_name||'?'} size={44} />
          <div>
            <div style={{ color:C.iceS, fontSize:12 }}>{creator.niches?.[0]||'—'} · {creator.followers_range||'—'}</div>
            <div style={{ display:'flex', gap:5, marginTop:4, flexWrap:'wrap' }}>
              <StatusBadge status={creator.status||'active'} />
              {creator.term_accepted && <Badge label="Termos ✓" color={C.ok} />}
              {creator.gender && <Badge label={creator.gender} color={C.violet} xs />}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', marginTop:13 }}>
          {[['data','Perfil'],['photos','Fotos'],['history','Histórico']].map(([t,l]) => (
            <button key={t} type="button" onClick={() => setTab(t)} style={{ flex:1, background:'transparent', border:'none', borderBottom:`2px solid ${tab===t?C.limen:'transparent'}`, color:tab===t?C.limen:C.textS, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:12, padding:'9px 0 13px', cursor:'pointer' }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 100px' }}>
        <Card style={{ marginBottom:13 }}><ProgressBar pct={creator.profile_pct||0} showLabel /></Card>

        {tab === 'data' && (
          <>
            {[
              {t:'Dados Básicos', i:[['Nome',creator.full_name],['Gênero',gLabel],['Cidade',creator.city||'—'],['Estado',creator.state||'—'],['WhatsApp',creator.phone||'—'],['E-mail',creator.email]]},
              {t:'Localização',   i:[['Distância',creator.max_distance||'—'],['Viaja',creator.accepts_travel?'Sim':'Não'],['Transporte',creator.has_transport?creator.transport_type:'Não possui'],['Depende terceiros',creator.depends_on_others?'Sim':'Não']]},
              {t:'Redes Sociais', i:[['Instagram',creator.instagram||'—'],['TikTok',creator.tiktok||'—'],['YouTube',creator.youtube||'—'],['Seguidores',creator.followers_range||'—']]},
              {t:'Disponibilidade',i:[['Recorrente',creator.recurring?'Sim':'Não'],['Frequência',creator.frequency||'—'],['Prazo',creator.delivery_deadline||'—'],['Períodos',creator.best_periods?.join(', ')||'—']]},
              {t:'Medidas',       i:[['Altura',creator.height||'—'],['Manequim',creator.clothing_size||'—'],['Calçado',creator.shoe_size||'—']]},
            ].map(s => (
              <div key={s.t} style={{ marginBottom:12 }}>
                <SLabel>{s.t}</SLabel>
                <Card style={{ padding:'10px 13px' }}>
                  {s.i.map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ color:C.textS, fontSize:11 }}>{k}</span>
                      <span style={{ color:C.text, fontSize:11, fontWeight:500, textAlign:'right', maxWidth:'55%' }}>{v}</span>
                    </div>
                  ))}
                </Card>
              </div>
            ))}
            {creator.niches?.length > 0 && <div style={{ marginBottom:12 }}><SLabel>Nichos</SLabel><div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{creator.niches.map(n=><Badge key={n} label={n} color={C.violet} xs />)}</div></div>}
            {creator.content_types?.length > 0 && <div style={{ marginBottom:12 }}><SLabel>Tipos de Conteúdo</SLabel><div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{creator.content_types.map(n=><Badge key={n} label={n} color={C.teal} xs />)}</div></div>}
            {creator.no_record?.length > 0 && <div style={{ marginBottom:12 }}><SLabel>Não Grava</SLabel><div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>{creator.no_record.map(n=><Badge key={n} label={n} color={C.rose} xs />)}</div></div>}
            {videos.length > 0 && <div style={{ marginBottom:12 }}><SLabel>Referências em Vídeo</SLabel>{videos.map(v=><div key={v.id} style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:8, padding:'7px 11px', marginBottom:5 }}><span style={{ color:C.teal, fontSize:11 }}>↗ {v.url}</span></div>)}</div>}
            {showExtra && creator.accepts_events && (
              <div style={{ marginBottom:12 }}>
                <SLabel>Eventos e Campanhas (EXTRA)</SLabel>
                <Card style={{ background:`${C.violet}10`, borderColor:`${C.violet}25` }}>
                  <div style={{ color:C.iceS, fontSize:12, marginBottom:7 }}>{creator.figurino||'—'}</div>
                  {creator.event_types?.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:7 }}>{creator.event_types.map(n=><Badge key={n} label={n} color={C.violet} xs />)}</div>}
                  {creator.campaign_types?.length > 0 && <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:7 }}>{creator.campaign_types.map(n=><Badge key={n} label={n} color={C.warn} xs />)}</div>}
                  {creator.event_note && <div style={{ color:C.iceS, fontSize:12, borderTop:`1px solid ${C.border}`, paddingTop:7 }}>{creator.event_note}</div>}
                </Card>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:4 }}>
              <Btn full onClick={() => setModal('invite')} style={{ background:C.limen, color:'#001621' }}>Enviar Convite Direto →</Btn>
              <Btn full variant="surf" onClick={handleShare} disabled={saving}>Compartilhar Perfil com Cliente</Btn>
            </div>
          </>
        )}

        {tab === 'photos' && (
          <>
            {facePhotos.length > 0 && <div style={{ marginBottom:14 }}><SLabel>Fotos de rosto</SLabel><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>{facePhotos.map(p=><img key={p.id} src={p.url} alt="rosto" style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', borderRadius:10, border:`1px solid ${C.border}` }}/>)}</div></div>}
            {bodyPhotos.length > 0 && <div><SLabel>Fotos de corpo inteiro</SLabel><div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>{bodyPhotos.map(p=><img key={p.id} src={p.url} alt="corpo" style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', borderRadius:10, border:`1px solid ${C.border}` }}/>)}</div></div>}
            {facePhotos.length === 0 && bodyPhotos.length === 0 && <div style={{ color:C.textM, fontSize:13, textAlign:'center', padding:'20px 0' }}>Nenhuma foto enviada ainda.</div>}
          </>
        )}

        {tab === 'history' && (
          <div style={{ color:C.textM, fontSize:13, textAlign:'center', padding:'20px 0' }}>Histórico de jobs disponível em breve.</div>
        )}
      </div>

      {/* Invite modal */}
      {modal === 'invite' && (
        <Modal onClose={() => setModal(null)} title={`Novo convite para ${creator.full_name?.split(' ')[0]}`}>
          <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
            <Input label="Título" value={form.title} onChange={v=>u('title',v)} placeholder="Nome da campanha" required />
            <Input label="Marca / Cliente" value={form.brand} onChange={v=>u('brand',v)} placeholder="Nome da marca" required />
            <Textarea label="Descrição" value={form.description} onChange={v=>u('description',v)} placeholder="Descreva o job..." rows={2} />
            <Input label="Entregas (separar por vírgula)" value={form.deliverables} onChange={v=>u('deliverables',v)} placeholder="2 Reels, 5 Stories" />
            <Input label="Cidade" value={form.city} onChange={v=>u('city',v)} placeholder="Cidade" />
            <Input label="Prazo" value={form.deadline} onChange={v=>u('deadline',v)} type="date" />
            <Input label="Valor (R$) — opcional" value={form.value} onChange={v=>u('value',v)} placeholder="3000" type="number" />
            <Input label="Observações" value={form.observations} onChange={v=>u('observations',v)} placeholder="Informações adicionais..." />
            <Btn full onClick={handleSendInvite} disabled={saving}>{saving?'Enviando...':'Enviar convite'}</Btn>
          </div>
        </Modal>
      )}

      {/* Share result modal */}
      {modal === 'share_result' && shareInfo && (
        <Modal onClose={() => setModal(null)} title="Compartilhar Perfil">
          <Card style={{ background:`${C.limen}08`, borderColor:`${C.limen}20`, marginBottom:14 }}>
            <div style={{ color:C.iceS, fontSize:12, lineHeight:1.55 }}>
              Link privado criado para compartilhar o perfil de <strong style={{ color:C.limen }}>{creator.full_name}</strong> com um cliente.
            </div>
          </Card>
          <SLabel>Link de acesso</SLabel>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:'10px 13px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ color:C.teal, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'75%' }}>
              {window.location.origin}/perfil/{shareInfo.code}
            </span>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/perfil/${shareInfo.code}`); setToast({ msg:'Link copiado!' }) }} style={{ background:C.limen, border:'none', borderRadius:6, padding:'5px 10px', color:'#001621', fontSize:11, fontWeight:600, cursor:'pointer', flexShrink:0 }}>Copiar</button>
          </div>
          <SLabel>Código de acesso</SLabel>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:'12px', textAlign:'center', marginBottom:12 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:C.limen, letterSpacing:'.1em' }}>{shareInfo.code}</div>
            <div style={{ color:C.textM, fontSize:11, marginTop:4 }}>Cliente digita este código para acessar</div>
          </div>
          {[['Validade','7 dias'],['Limite de acessos',`${shareInfo.max_views} visualizações`]].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.border}` }}>
              <span style={{ color:C.textS, fontSize:12 }}>{k}</span>
              <span style={{ color:C.text, fontSize:12, fontWeight:500 }}>{v}</span>
            </div>
          ))}
        </Modal>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
