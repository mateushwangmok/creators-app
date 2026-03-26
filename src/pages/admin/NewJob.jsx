import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { createJob } from '../../services/jobs'
import { PageHeader, Btn, Input, SelectField, Textarea, Card, Badge, Toast } from '../../components/ui/index'
import { C, NICHES } from '../../styles/tokens'

export default function AdminNewJob() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)
  const [form, setForm] = useState({
    type:'open', title:'', brand:'', category:'', description:'',
    deliverables:'', city:'', deadline:'', value:'', observations:'',
  })
  const u = (k,v) => setForm(f => ({ ...f, [k]:v }))

  const handleSave = async () => {
    if (!form.title || !form.brand) { setToast({ msg:'Preencha título e marca.', type:'error' }); return }
    setSaving(true)
    try {
      const job = await createJob({
        type:         form.type,
        title:        form.title,
        brand:        form.brand,
        category:     form.category || 'Geral',
        description:  form.description,
        deliverables: form.deliverables.split(',').map(s=>s.trim()).filter(Boolean),
        city:         form.city,
        deadline:     form.deadline || null,
        value:        form.value ? parseFloat(form.value) : null,
        observations: form.observations,
        status:       'open',
        created_by:   profile.id,
      })
      setToast({ msg:'Job publicado com sucesso!' })
      setTimeout(() => navigate('/admin/jobs'), 1200)
    } catch (e) { setToast({ msg: e.message, type:'error' }) }
    setSaving(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }} className="screen">
      <PageHeader title="Novo Job" onBack={() => navigate('/admin/jobs')} />
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px 40px' }}>
        {/* Type selector */}
        <div style={{ display:'flex', background:C.card, borderRadius:10, padding:3, gap:3, marginBottom:16 }}>
          {[['open','Job Aberto'],['direct','Convite Direto']].map(([t,l]) => (
            <button key={t} type="button" onClick={() => u('type',t)} style={{ flex:1, padding:'9px', borderRadius:8, border:'none', background:form.type===t?(t==='open'?C.limen:C.rose):'transparent', color:form.type===t?'#001621':C.textS, fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:12, cursor:'pointer' }}>
              {l}
            </button>
          ))}
        </div>

        <Card style={{ background:form.type==='open'?`${C.teal}10`:`${C.rose}10`, borderColor:form.type==='open'?`${C.teal}25`:`${C.rose}25`, marginBottom:14, padding:'11px 13px' }}>
          <span style={{ color:form.type==='open'?C.teal:C.rose, fontSize:12, lineHeight:1.5 }}>
            {form.type==='open'
              ? 'Job Aberto: gera um link. Qualquer creator pode enviar proposta confidencial.'
              : 'Convite Direto: você seleciona a creator. Apenas ela recebe e pode aceitar ou recusar.'}
          </span>
        </Card>

        <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
          <Input label="Título *" value={form.title} onChange={v=>u('title',v)} placeholder="Nome da campanha" required />
          <Input label="Marca / Cliente *" value={form.brand} onChange={v=>u('brand',v)} placeholder="Nome da marca" required />
          <SelectField label="Categoria" value={form.category} onChange={v=>u('category',v)} options={NICHES} />
          <Textarea label="Descrição" value={form.description} onChange={v=>u('description',v)} placeholder="Descreva o job..." rows={3} />
          <Input label="Entregas (separar por vírgula)" value={form.deliverables} onChange={v=>u('deliverables',v)} placeholder="2 Reels, 5 Stories, 1 Post" />
          <Input label="Cidade" value={form.city} onChange={v=>u('city',v)} placeholder="São Paulo" />
          <Input label="Prazo" value={form.deadline} onChange={v=>u('deadline',v)} type="date" />
          <Input label="Valor (R$) — opcional" value={form.value} onChange={v=>u('value',v)} placeholder="3000" type="number" />
          <Textarea label="Observações" value={form.observations} onChange={v=>u('observations',v)} placeholder="Informações adicionais..." rows={2} />
          <Btn full onClick={handleSave} disabled={saving}>
            {saving ? 'Publicando...' : form.type==='open' ? 'Publicar e gerar link' : 'Criar convite direto'}
          </Btn>
          {form.type === 'open' && (
            <div style={{ background:C.surf, border:`1px dashed ${C.borderM}`, borderRadius:10, padding:'11px 13px', textAlign:'center' }}>
              <div style={{ color:C.textM, fontSize:10 }}>Link gerado após salvar:</div>
              <div style={{ color:C.limen, fontSize:11, marginTop:3, fontFamily:'monospace' }}>
                {window.location.origin}/creator/job-aberto/[ID]
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
