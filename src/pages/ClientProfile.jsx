import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { getShareByCode, incrementShareView, getPhotos, getVideoLinks } from '../services/profiles'
import { Logo, Avatar, Badge, SLabel, Card } from '../components/ui/index'
import Spinner from '../components/ui/Spinner'
import { C } from '../styles/tokens'

export default function ClientProfile() {
  const { shareCode } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const clientName = searchParams.get('nome') || 'Cliente'

  const [share, setShare]   = useState(null)
  const [photos, setPhotos] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getShareByCode(shareCode)
        if (!s) { setError('Código inválido ou expirado.'); setLoading(false); return }
        if (new Date(s.expires_at) < new Date()) { setError('Este link expirou.'); setLoading(false); return }
        if (s.view_count >= s.max_views) { setError('Limite de acessos atingido.'); setLoading(false); return }
        setShare(s)
        await incrementShareView(s.id)
        const [p, v] = await Promise.all([getPhotos(s.creator_id), getVideoLinks(s.creator_id)])
        setPhotos(p)
        setVideos(v)
      } catch { setError('Erro ao carregar perfil.') }
      setLoading(false)
    }
    load()
  }, [shareCode])

  if (loading) return <div className="screen" style={{ alignItems:'center', justifyContent:'center' }}><Spinner /></div>

  if (error) return (
    <div className="screen">
      <div className="body-scroll" style={{ textAlign:'center', paddingTop:60 }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
        <div style={{ color:C.text, fontWeight:600, fontSize:18, marginBottom:8 }}>{error}</div>
        <p style={{ color:C.textS, fontSize:13 }}>Entre em contato com Mateus Hwangmok para obter um novo link.</p>
        <button type="button" onClick={() => navigate('/acesso-cliente')} style={{ marginTop:24, background:'transparent', border:'none', color:C.limen, fontSize:13, cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>← Tentar outro código</button>
      </div>
    </div>
  )

  const creator = share.creator
  const facePhotos = photos.filter(p => p.photo_type === 'face')
  const bodyPhotos = photos.filter(p => p.photo_type === 'body')

  return (
    <div className="screen">
      <div style={{ background:C.surf, padding:'13px 20px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <Logo compact />
        <div style={{ color:C.textM, fontSize:10, marginTop:6 }}>Acesso compartilhado · {clientName}</div>
      </div>
      <div className="body-scroll">
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:13, marginBottom:20 }}>
          <Avatar name={creator.full_name || '?'} size={54} />
          <div>
            <div style={{ color:C.text, fontWeight:700, fontSize:18 }}>{creator.full_name}</div>
            <div style={{ color:C.iceS, fontSize:13, marginTop:2 }}>{creator.city || '—'}, {creator.state || '—'}</div>
          </div>
        </div>

        {/* Key info */}
        {[
          ['Seguidores', creator.followers_range || '—'],
          ['Aceita viajar', creator.accepts_travel ? 'Sim' : 'Não'],
          ['Distância máx.', creator.max_distance || '—'],
          ['Instagram', creator.instagram || '—'],
          ['TikTok', creator.tiktok || '—'],
          ['YouTube', creator.youtube || '—'],
        ].map(([k, v]) => (
          <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:`1px solid ${C.border}` }}>
            <span style={{ color:C.textS, fontSize:13 }}>{k}</span>
            <span style={{ color:C.text, fontSize:13, fontWeight:500 }}>{v}</span>
          </div>
        ))}

        {/* Niches */}
        {creator.niches?.length > 0 && (
          <div style={{ marginTop:16 }}>
            <SLabel>Nichos</SLabel>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {creator.niches.map(n => <Badge key={n} label={n} color={C.violet} />)}
            </div>
          </div>
        )}

        {/* Content types */}
        {creator.content_types?.length > 0 && (
          <div style={{ marginTop:14 }}>
            <SLabel>Tipos de Conteúdo</SLabel>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {creator.content_types.map(n => <Badge key={n} label={n} color={C.teal} />)}
            </div>
          </div>
        )}

        {/* Cities served */}
        {creator.cities_served?.length > 0 && (
          <div style={{ marginTop:14 }}>
            <SLabel>Cidades atendidas</SLabel>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {creator.cities_served.map(c => <Badge key={c} label={c} color={C.iceS} />)}
            </div>
          </div>
        )}

        {/* Face photos */}
        {facePhotos.length > 0 && (
          <div style={{ marginTop:16 }}>
            <SLabel>Fotos de rosto</SLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {facePhotos.map(p => (
                <img key={p.id} src={p.url} alt="rosto" style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', borderRadius:10, border:`1px solid ${C.border}` }} />
              ))}
            </div>
          </div>
        )}

        {/* Body photos */}
        {bodyPhotos.length > 0 && (
          <div style={{ marginTop:14 }}>
            <SLabel>Fotos de corpo inteiro</SLabel>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {bodyPhotos.map(p => (
                <img key={p.id} src={p.url} alt="corpo" style={{ width:'100%', aspectRatio:'3/4', objectFit:'cover', borderRadius:10, border:`1px solid ${C.border}` }} />
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div style={{ marginTop:14 }}>
            <SLabel>Referências em vídeo</SLabel>
            {videos.map(v => (
              <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:C.surf, border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 12px', marginBottom:6, textDecoration:'none' }}>
                <span style={{ color:C.teal, fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'85%' }}>↗ {v.url}</span>
              </a>
            ))}
          </div>
        )}

        <Card style={{ background:C.surf, borderColor:C.border, marginTop:20, padding:'11px 13px' }}>
          <div style={{ color:C.textM, fontSize:11, lineHeight:1.5 }}>
            Perfil compartilhado por Mateus Hwangmok. Informações de contato, valores e dados internos não são exibidos nesta visualização.
          </div>
        </Card>
      </div>
    </div>
  )
}
