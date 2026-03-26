import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { upsertProfile, getPhotos, savePhoto, deletePhoto, getVideoLinks, saveVideoLink, deleteVideoLink, getCitiesServed, saveCities } from '../../services/profiles'
import { getActiveEventRefs } from '../../services/jobs'
import { uploadPhoto, calcProfilePct } from '../../lib/helpers'
import { supabase } from '../../lib/supabase'
import {
  Logo, Btn, Input, SelectField, Textarea, Chips, Toggle, RadioGroup,
  ProgressBar, Card, SLabel, Divider, Badge, PhotoSlot, Toast,
} from '../../components/ui/index'
import Spinner from '../../components/ui/Spinner'
import { C, NICHES, CONTENT_TYPES, NO_RECORD, EVENT_TYPES, FIGURINO_OPTIONS, CAMPANHA_TYPES, STATES, AGE_RANGES, FOLLOWER_RANGES, DIST_OPTIONS, FREQ_OPTIONS, DEADLINE_OPT, PERIODS, isFeminineProfile } from '../../styles/tokens'

function buildSteps(gender, genderOther) {
  const base = [
    'Informações Básicas','Localização & Logística','Fotos do Perfil',
    'Referências em Vídeo','Redes Sociais','Nichos','Tipos de Conteúdo',
    'O que não grava','Disponibilidade','Infos Complementares','Termos de Aceite',
  ]
  if (isFeminineProfile(gender, genderOther)) {
    base.splice(base.length - 1, 0, 'EXTRA — Eventos e Campanhas')
  }
  return base
}

export default function ProfileEdit() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)
  const [eventRefs, setEventRefs] = useState([])
  const fileInputRef = useRef(null)
  const [uploadTarget, setUploadTarget] = useState(null) // {type, idx}
  const [uploadLoading, setUploadLoading] = useState({})

  // Photos & videos
  const [photos, setPhotos] = useState({ face:[], body:[] }) // {id, url}
  const [videos, setVideos] = useState([]) // {id, url}
  const [newVideo, setNewVideo] = useState('')
  const [cities, setCities]   = useState([])
  const [newCity, setNewCity]  = useState('')

  // Form data (mirrors profile columns)
  const [d, setD] = useState({
    city:'', state:'', age_range:'',
    cities_served:[],
    accepts_travel:false, max_distance:'',
    has_transport:false, transport_type:'', depends_on_others:false,
    instagram:'', tiktok:'', youtube:'', other_social:'', followers_range:'',
    niches:[], content_types:[], no_record:[], no_record_note:'',
    recurring:false, frequency:'', delivery_deadline:'', best_periods:[],
    height:'', clothing_size:'', shoe_size:'', extra_notes:'',
    accepts_events:false, event_types:[], figurino:'', campaign_types:[], event_note:'',
    term_accepted:false,
  })
  const u = (k, v) => setD(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!profile) return
    setD({
      city:                profile.city || '',
      state:               profile.state || '',
      age_range:           profile.age_range || '',
      accepts_travel:      profile.accepts_travel || false,
      max_distance:        profile.max_distance || '',
      has_transport:       profile.has_transport || false,
      transport_type:      profile.transport_type || '',
      depends_on_others:   profile.depends_on_others || false,
      instagram:           profile.instagram || '',
      tiktok:              profile.tiktok || '',
      youtube:             profile.youtube || '',
      other_social:        profile.other_social || '',
      followers_range:     profile.followers_range || '',
      niches:              profile.niches || [],
      content_types:       profile.content_types || [],
      no_record:           profile.no_record || [],
      no_record_note:      profile.no_record_note || '',
      recurring:           profile.recurring || false,
      frequency:           profile.frequency || '',
      delivery_deadline:   profile.delivery_deadline || '',
      best_periods:        profile.best_periods || [],
      height:              profile.height || '',
      clothing_size:       profile.clothing_size || '',
      shoe_size:           profile.shoe_size || '',
      extra_notes:         profile.extra_notes || '',
      accepts_events:      profile.accepts_events || false,
      event_types:         profile.event_types || [],
      figurino:            profile.figurino || '',
      campaign_types:      profile.campaign_types || [],
      event_note:          profile.event_note || '',
      term_accepted:       profile.term_accepted || false,
    })

    const loadExtras = async () => {
      const [p, v, c, refs] = await Promise.all([
        getPhotos(profile.id),
        getVideoLinks(profile.id),
        getCitiesServed(profile.id),
        getActiveEventRefs(),
      ])
      setPhotos({ face: p.filter(x=>x.photo_type==='face'), body: p.filter(x=>x.photo_type==='body') })
      setVideos(v)
      setCities(c)
      setEventRefs(refs)
    }
    loadExtras()
  }, [profile])

  const steps = buildSteps(profile?.gender, profile?.gender_other)
  const total  = steps.length

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveCities(profile.id, cities)
      const pct = calcProfilePct({ ...d, cities_served: cities, video_links: videos })
      await upsertProfile(profile.id, { ...d, cities_served: cities, profile_pct: pct })
      await refreshProfile()
      setToast({ msg: 'Perfil atualizado! ✓' })
      setTimeout(() => navigate('/creator'), 1500)
    } catch (e) {
      setToast({ msg: e.message, type: 'error' })
    }
    setSaving(false)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !uploadTarget) return
    const key = `${uploadTarget.type}_${uploadTarget.idx}`
    setUploadLoading(p => ({ ...p, [key]: true }))
    try {
      const url = await uploadPhoto(supabase, file, profile.id, uploadTarget.type)
      const saved = await savePhoto(profile.id, uploadTarget.type, url)
      setPhotos(p => {
        const arr = [...p[uploadTarget.type]]
        arr[uploadTarget.idx] = saved
        return { ...p, [uploadTarget.type]: arr }
      })
    } catch (e) { setToast({ msg: e.message, type: 'error' }) }
    setUploadLoading(p => { const n={...p}; delete n[key]; return n })
  }

  const triggerUpload = (type, idx) => {
    setUploadTarget({ type, idx })
    fileInputRef.current?.click()
  }

  const addVideo = async () => {
    if (!newVideo || videos.length >= 6) return
    try {
      const saved = await saveVideoLink(profile.id, newVideo)
      setVideos(p => [...p, saved])
      setNewVideo('')
    } catch (e) { setToast({ msg: e.message, type:'error' }) }
  }

  const removeVideo = async (id) => {
    try { await deleteVideoLink(id); setVideos(p => p.filter(v => v.id !== id)) }
    catch (e) { setToast({ msg: e.message, type:'error' }) }
  }

  const currentStepName = steps[step]

  const renderStep = () => {
    if (currentStepName === 'Informações Básicas') return (
      <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
        <Input label="Nome" value={profile?.full_name || ''} onChange={()=>{}} disabled />
        <SelectField label="Faixa etária" value={d.age_range} onChange={v=>u('age_range',v)} options={AGE_RANGES} />
        <Input label="Cidade" value={d.city} onChange={v=>u('city',v)} placeholder="Sua cidade" />
        <SelectField label="Estado" value={d.state} onChange={v=>u('state',v)} options={STATES} />
      </div>
    )

    if (currentStepName === 'Localização & Logística') return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <SLabel>Cidades que atende</SLabel>
          <div style={{ display:'flex', gap:7 }}>
            <input value={newCity} onChange={e=>setNewCity(e.target.value)} placeholder="Ex: Guarulhos"
              style={{ flex:1, background:C.surf, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontFamily:"'Outfit',sans-serif", fontSize:13, outline:'none' }}/>
            <Btn small onClick={() => { if(newCity){setCities(p=>[...p,newCity]);setNewCity('')} }}>+</Btn>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
            {cities.map((c,i) => (
              <span key={i} style={{ background:C.limenFade, color:C.limen, border:`1px solid ${C.limen}28`, borderRadius:16, padding:'4px 10px', fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                {c}<span style={{ cursor:'pointer', color:C.rose }} onClick={()=>setCities(p=>p.filter((_,j)=>j!==i))}>×</span>
              </span>
            ))}
          </div>
        </div>
        <Toggle value={d.accepts_travel} onChange={v=>u('accepts_travel',v)} label="Aceita trabalhos fora da cidade?" />
        <SelectField label="Distância máxima" value={d.max_distance} onChange={v=>u('max_distance',v)} options={DIST_OPTIONS} />
        <Toggle value={d.has_transport} onChange={v=>u('has_transport',v)} label="Possui transporte próprio?" />
        {d.has_transport && <SelectField label="Tipo de transporte" value={d.transport_type} onChange={v=>u('transport_type',v)} options={['Carro','Moto','Outro']} />}
        <Toggle value={d.depends_on_others} onChange={v=>u('depends_on_others',v)} label="Depende de terceiros para se locomover?" />
      </div>
    )

    if (currentStepName === 'Fotos do Perfil') return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoUpload} />
        <Card style={{ background:`${C.limen}08`, borderColor:`${C.limen}20`, padding:'13px' }}>
          <p style={{ color:C.iceS, fontSize:13, lineHeight:1.55 }}>Escolha fotos claras, atuais e que representem bem o seu perfil.</p>
        </Card>
        <div>
          <SLabel>3 fotos de rosto</SLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[0,1,2].map(i => (
              <PhotoSlot key={i} url={photos.face[i]?.url} label={`Rosto ${i+1}`}
                onUpload={() => triggerUpload('face', i)}
                loading={!!uploadLoading[`face_${i}`]} />
            ))}
          </div>
        </div>
        <div>
          <SLabel>3 fotos de corpo inteiro</SLabel>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[0,1,2].map(i => (
              <PhotoSlot key={i} url={photos.body[i]?.url} label={`Corpo ${i+1}`}
                onUpload={() => triggerUpload('body', i)}
                loading={!!uploadLoading[`body_${i}`]} />
            ))}
          </div>
        </div>
      </div>
    )

    if (currentStepName === 'Referências em Vídeo') return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Card style={{ background:`${C.limen}08`, borderColor:`${C.limen}20`, padding:'13px' }}>
          <p style={{ color:C.iceS, fontSize:13, lineHeight:1.55 }}>
            Adicione links de vídeos que mostrem sua comunicação e estilo.<br/>
            <strong style={{ color:C.limen }}>Mínimo 3 links, ideal até 6.</strong>
          </p>
          <div style={{ color:C.textM, fontSize:12, marginTop:6 }}>Aceito: Instagram, TikTok, YouTube, Google Drive</div>
        </Card>
        <div>
          <SLabel>Links de referência ({videos.length}/6)</SLabel>
          <div style={{ display:'flex', gap:7 }}>
            <input value={newVideo} onChange={e=>setNewVideo(e.target.value)} placeholder="https://..."
              style={{ flex:1, background:C.surf, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 12px', color:C.text, fontFamily:"'Outfit',sans-serif", fontSize:13, outline:'none' }}/>
            <Btn small onClick={addVideo} disabled={videos.length >= 6}>+</Btn>
          </div>
          {videos.map(v => (
            <div key={v.id} style={{ marginTop:6, background:C.surf, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:C.teal, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'82%' }}>↗ {v.url}</span>
              <span style={{ color:C.rose, cursor:'pointer' }} onClick={()=>removeVideo(v.id)}>×</span>
            </div>
          ))}
        </div>
        {videos.length > 0 && videos.length < 3 && (
          <div style={{ background:`${C.warn}15`, borderRadius:9, padding:'10px 12px' }}>
            <span style={{ color:C.warn, fontSize:12 }}>⚠ Adicione pelo menos {3-videos.length} link{3-videos.length>1?'s':''} a mais</span>
          </div>
        )}
      </div>
    )

    if (currentStepName === 'Redes Sociais') return (
      <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
        <Input label="Instagram" value={d.instagram} onChange={v=>u('instagram',v)} placeholder="@seuperfil" />
        <Input label="TikTok" value={d.tiktok} onChange={v=>u('tiktok',v)} placeholder="@seuperfil" />
        <Input label="YouTube" value={d.youtube} onChange={v=>u('youtube',v)} placeholder="@seucanal" />
        <Input label="Outras redes" value={d.other_social} onChange={v=>u('other_social',v)} placeholder="Twitter, Pinterest..." />
        <SelectField label="Seguidores aproximados" value={d.followers_range} onChange={v=>u('followers_range',v)} options={FOLLOWER_RANGES} />
      </div>
    )

    if (currentStepName === 'Nichos') return (
      <Chips label="Nichos (selecione todos que se aplicam)" options={NICHES} selected={d.niches} onChange={v=>u('niches',v)} columns={2} />
    )

    if (currentStepName === 'Tipos de Conteúdo') return (
      <Chips label="Tipos de conteúdo que você produz" options={CONTENT_TYPES} selected={d.content_types} onChange={v=>u('content_types',v)} columns={2} />
    )

    if (currentStepName === 'O que não grava') return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Chips label="O que você NÃO grava" options={NO_RECORD} selected={d.no_record} onChange={v=>u('no_record',v)} columns={2} />
        <Textarea label="Explicação (opcional)" value={d.no_record_note} onChange={v=>u('no_record_note',v)} placeholder="Ex: por motivos pessoais não gravo conteúdos religiosos..." rows={2} />
      </div>
    )

    if (currentStepName === 'Disponibilidade') return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Toggle value={d.recurring} onChange={v=>u('recurring',v)} label="Aceita campanhas recorrentes?" />
        <SelectField label="Frequência disponível" value={d.frequency} onChange={v=>u('frequency',v)} options={FREQ_OPTIONS} />
        <SelectField label="Prazo médio de entrega" value={d.delivery_deadline} onChange={v=>u('delivery_deadline',v)} options={DEADLINE_OPT} />
        <Chips label="Melhor período" options={PERIODS} selected={d.best_periods} onChange={v=>u('best_periods',v)} columns={2} />
      </div>
    )

    if (currentStepName === 'Infos Complementares') return (
      <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
        <Card style={{ background:`${C.violet}10`, borderColor:`${C.violet}25`, padding:'12px' }}>
          <span style={{ color:C.violet, fontSize:12 }}>Bloco opcional — preencha se quiser.</span>
        </Card>
        <Input label="Altura" value={d.height} onChange={v=>u('height',v)} placeholder="Ex: 1,68" />
        <Input label="Manequim / Roupa" value={d.clothing_size} onChange={v=>u('clothing_size',v)} placeholder="Ex: M / 38" />
        <Input label="Calçado" value={d.shoe_size} onChange={v=>u('shoe_size',v)} placeholder="Ex: 36" />
        <Textarea label="Observações" value={d.extra_notes} onChange={v=>u('extra_notes',v)} placeholder="Tatuagens, características físicas relevantes..." rows={2} />
      </div>
    )

    if (currentStepName === 'EXTRA — Eventos e Campanhas') return (
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div style={{ borderBottom:`1px solid ${C.border}`, paddingBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <Badge label="EXTRA" color={C.violet} />
            <Badge label="Opcional" color={C.textS} xs />
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:20, color:C.text, marginBottom:3 }}>Eventos e Campanhas Presenciais</div>
        </div>
        <Card style={{ background:`${C.violet}10`, borderColor:`${C.violet}25`, padding:'14px' }}>
          <p style={{ color:C.iceS, fontSize:13, lineHeight:1.65 }}>Esta é uma categoria adicional de oportunidades. O preenchimento é <strong style={{ color:C.text }}>opcional</strong>.</p>
          <p style={{ color:C.textM, fontSize:12, marginTop:8, lineHeight:1.6 }}>Se você não quiser participar desse tipo de job, pode simplesmente seguir e concluir o seu cadastro normalmente.</p>
        </Card>
        <div style={{ color:C.iceS, fontSize:13, lineHeight:1.7 }}>
          <p>Algumas campanhas e eventos podem envolver ações presenciais, ativações de marca e participação em ambientes promocionais.</p>
          <p style={{ marginTop:8 }}>Em alguns casos, esses eventos podem incluir o uso de roupas, uniformes ou figurinos definidos pela proposta do evento.</p>
          <p style={{ marginTop:8, fontWeight:600, color:C.text }}>Veja abaixo exemplos reais de campanhas e eventos similares:</p>
        </div>
        {eventRefs.length > 0 && (
          <div>
            <SLabel>Referências de campanhas e eventos</SLabel>
            <div style={{ color:C.textM, fontSize:11, marginBottom:9 }}>Clique para visualizar exemplos reais.</div>
            {eventRefs.map(r => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:C.surf, border:`1px solid ${C.border}`, borderRadius:9, padding:'11px 13px', marginBottom:7, textDecoration:'none', cursor:'pointer' }}>
                <span style={{ color:C.text, fontSize:13 }}>{r.name}</span>
                <span style={{ color:C.teal, fontSize:14 }}>↗</span>
              </a>
            ))}
          </div>
        )}
        <Divider label="Sua participação" />
        <RadioGroup label="Aceita participar de eventos presenciais?" options={['Sim','Não']} value={d.accepts_events ? 'Sim' : (d.event_types.length > 0 ? 'Sim' : '')} onChange={v=>u('accepts_events', v==='Sim')} />
        {d.accepts_events && (
          <>
            <Chips label="Tipos de ação (múltipla seleção)" options={EVENT_TYPES} selected={d.event_types} onChange={v=>u('event_types',v)} columns={2} />
            <RadioGroup label="Sobre uso de figurino" options={FIGURINO_OPTIONS} value={d.figurino} onChange={v=>u('figurino',v)} />
            <Chips label="Tipo de campanha" options={CAMPANHA_TYPES} selected={d.campaign_types} onChange={v=>u('campaign_types',v)} columns={1} />
            <Textarea label="Observação (opcional)" value={d.event_note} onChange={v=>u('event_note',v)} placeholder='Ex: Aceito participar de eventos e utilizar figurinos definidos pela proposta, desde que alinhados ao trabalho.' rows={3} />
          </>
        )}
      </div>
    )

    if (currentStepName === 'Termos de Aceite') return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:12, padding:'15px', height:210, overflowY:'auto', fontFamily:"'Outfit',sans-serif", color:C.iceS, fontSize:12, lineHeight:1.8 }}>
          <strong style={{ color:C.text, display:'block', marginBottom:10 }}>TERMOS DE PARTICIPAÇÃO — CREATORS FROM MATEUS HWANGMOK</strong>
          Ao fazer parte desta rede, o creator parceiro concorda com:{'\n\n'}
          1. CONFIDENCIALIDADE: Todas as informações sobre jobs, clientes e valores são estritamente confidenciais.{'\n\n'}
          2. PROPOSTAS: Ao enviar uma proposta, o creator se compromete a honrar os valores informados.{'\n\n'}
          3. QUALIDADE: Comprometer-se a entregar conteúdos de alta qualidade nos prazos acordados.{'\n\n'}
          4. PRIVACIDADE: Os dados serão utilizados exclusivamente por Mateus Hwangmok para matching e oportunidades.{'\n\n'}
          5. RECUSA: O creator pode recusar jobs. Recusas frequentes sem justificativa podem implicar desligamento da rede.{'\n\n'}
          Versão 1.0 — 2025. Gestão: Mateus Hwangmok.
        </div>
        <label style={{ display:'flex', alignItems:'flex-start', gap:11, cursor:'pointer' }}>
          <div onClick={() => u('term_accepted', !d.term_accepted)} style={{ width:21, height:21, borderRadius:6, flexShrink:0, marginTop:1, border:`2px solid ${d.term_accepted?C.limen:C.borderM}`, background:d.term_accepted?C.limen:'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {d.term_accepted && <span style={{ color:'#001621', fontSize:11, fontWeight:800 }}>✓</span>}
          </div>
          <span style={{ color:C.iceS, fontSize:13, lineHeight:1.5 }}>Li e concordo com os termos de participação da rede Creators by Mateus Hwangmok</span>
        </label>
      </div>
    )

    return null
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ background:C.surf, padding:'14px 20px 0', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:11 }}>
          <Logo compact />
          <span style={{ color:C.textS, fontSize:11 }}>{step+1} / {total}</span>
        </div>
        <div style={{ display:'flex', gap:3, marginBottom:11 }}>
          {steps.map((_,i) => (
            <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<step?C.ok:i===step?C.limen:C.border, transition:'background .3s' }} />
          ))}
        </div>
        <div style={{ paddingBottom:13 }}>
          <div style={{ color:C.limen, fontSize:10, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:2 }}>
            {String(step+1).padStart(2,'0')} — {currentStepName}
          </div>
          <div style={{ color:C.textM, fontSize:11 }}>Completar perfil</div>
        </div>
      </div>

      <div className="body-scroll">
        <div className="fu" key={step}>{renderStep()}</div>
      </div>

      {/* Footer nav */}
      <div style={{ padding:'12px 20px', borderTop:`1px solid ${C.border}`, background:C.surf, display:'flex', gap:9, flexShrink:0 }}>
        <Btn variant="outline" onClick={() => step > 0 ? setStep(s=>s-1) : navigate('/creator')} style={{ flex:1 }}>
          {step === 0 ? 'Cancelar' : '← Anterior'}
        </Btn>
        <Btn
          onClick={() => step < total-1 ? setStep(s=>s+1) : handleSave()}
          style={{ flex:2 }}
          disabled={(currentStepName === 'Termos de Aceite' && !d.term_accepted) || saving}
        >
          {saving ? 'Salvando...' : step === total-1 ? 'Concluir ✓' : 'Próximo →'}
        </Btn>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
