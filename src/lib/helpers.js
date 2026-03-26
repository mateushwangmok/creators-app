// Gera código único de compartilhamento
export function generateShareCode(name = '') {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `${initials}${rand}`
}

// Formata moeda BRL
export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// Formata data
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

// Calcula % de preenchimento do perfil
export function calcProfilePct(profile) {
  const checks = [
    profile?.city && profile?.state && profile?.age_range,
    profile?.gender,
    (profile?.cities_served || []).length > 0 && profile?.max_distance,
    (profile?.video_links || []).length >= 3,
    profile?.instagram,
    (profile?.niches || []).length > 0,
    (profile?.content_types || []).length > 0,
    profile?.frequency && profile?.delivery_deadline,
    profile?.term_accepted,
  ].filter(Boolean).length
  return Math.round((checks / 9) * 100)
}

// Upload de foto para Supabase Storage
export async function uploadPhoto(supabase, file, userId, folder) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${folder}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('creator-photos')
    .upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from('creator-photos')
    .getPublicUrl(path)
  return publicUrl
}
