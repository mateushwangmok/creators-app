import { supabase } from '../lib/supabase'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function upsertProfile(userId, payload) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...payload, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getAllCreators(filters = {}) {
  let q = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'creator')
    .order('created_at', { ascending: false })

  if (filters.gender)   q = q.eq('gender', filters.gender)
  if (filters.state)    q = q.eq('state', filters.state)
  if (filters.travel === 'sim') q = q.eq('accepts_travel', true)
  if (filters.travel === 'não') q = q.eq('accepts_travel', false)
  if (filters.transport === 'sim') q = q.eq('has_transport', true)
  if (filters.transport === 'não') q = q.eq('has_transport', false)

  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function getCreatorById(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Fotos
export async function getPhotos(creatorId) {
  const { data } = await supabase
    .from('creator_photos')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: true })
  return data || []
}

export async function savePhoto(creatorId, photoType, url) {
  const { data, error } = await supabase
    .from('creator_photos')
    .insert({ creator_id: creatorId, photo_type: photoType, url })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePhoto(photoId) {
  const { error } = await supabase
    .from('creator_photos')
    .delete()
    .eq('id', photoId)
  if (error) throw error
}

// Video links
export async function getVideoLinks(creatorId) {
  const { data } = await supabase
    .from('creator_video_links')
    .select('*')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: true })
  return data || []
}

export async function saveVideoLink(creatorId, url) {
  const { data, error } = await supabase
    .from('creator_video_links')
    .insert({ creator_id: creatorId, url })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteVideoLink(linkId) {
  const { error } = await supabase
    .from('creator_video_links')
    .delete()
    .eq('id', linkId)
  if (error) throw error
}

// Cities served
export async function getCitiesServed(creatorId) {
  const { data } = await supabase
    .from('creator_cities')
    .select('city')
    .eq('creator_id', creatorId)
  return (data || []).map(r => r.city)
}

export async function saveCities(creatorId, cities) {
  await supabase.from('creator_cities').delete().eq('creator_id', creatorId)
  if (cities.length === 0) return
  const { error } = await supabase
    .from('creator_cities')
    .insert(cities.map(city => ({ creator_id: creatorId, city })))
  if (error) throw error
}

// Share links
export async function createShareLink(creatorId, adminId) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase()
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('profile_shares')
    .insert({ creator_id: creatorId, created_by: adminId, code, expires_at: expires, max_views: 10, view_count: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getShareByCode(code) {
  const { data, error } = await supabase
    .from('profile_shares')
    .select('*, creator:profiles(*)')
    .eq('code', code)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function incrementShareView(shareId) {
  await supabase.rpc('increment_share_view', { share_id: shareId })
}
