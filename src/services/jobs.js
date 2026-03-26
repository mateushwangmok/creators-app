import { supabase } from '../lib/supabase'

// ── Jobs ──────────────────────────────────────────────

export async function createJob(payload) {
  const { data, error } = await supabase
    .from('jobs')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getJobById(id) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getAllJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateJobStatus(id, status) {
  const { error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

// ── Direct job invites ────────────────────────────────

export async function createInvite(jobId, creatorId) {
  const { data, error } = await supabase
    .from('job_invites')
    .insert({ job_id: jobId, creator_id: creatorId, status: 'pending' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getInvitesForJob(jobId) {
  const { data, error } = await supabase
    .from('job_invites')
    .select('*, creator:profiles(id,full_name,instagram,niches,followers_range)')
    .eq('job_id', jobId)
  if (error) throw error
  return data || []
}

export async function getMyInvites(creatorId) {
  const { data, error } = await supabase
    .from('job_invites')
    .select('*, job:jobs(*)')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateInviteStatus(inviteId, status) {
  const { error } = await supabase
    .from('job_invites')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', inviteId)
  if (error) throw error
}

// ── Open job bids (proposals) ─────────────────────────

export async function submitBid(jobId, creatorId, amount, note) {
  const { data, error } = await supabase
    .from('bids')
    .insert({ job_id: jobId, creator_id: creatorId, amount, note })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getBidsForJob(jobId) {
  const { data, error } = await supabase
    .from('bids')
    .select('*, creator:profiles(id,full_name,instagram,niches,followers_range)')
    .eq('job_id', jobId)
    .order('amount', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getMyBids(creatorId) {
  const { data, error } = await supabase
    .from('bids')
    .select('*, job:jobs(*)')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getBidCount(jobId) {
  const { count, error } = await supabase
    .from('bids')
    .select('*', { count: 'exact', head: true })
    .eq('job_id', jobId)
  if (error) throw error
  return count || 0
}

export async function getOpenJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('type', 'open')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Event references ──────────────────────────────────

export async function getEventRefs() {
  const { data, error } = await supabase
    .from('event_references')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getActiveEventRefs() {
  const { data, error } = await supabase
    .from('event_references')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function upsertEventRef(ref) {
  const { data, error } = await supabase
    .from('event_references')
    .upsert(ref)
    .select()
    .single()
  if (error) throw error
  return data
}
