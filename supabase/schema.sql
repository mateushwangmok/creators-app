-- ============================================================
--  CREATORS FROM MATEUS HWANGMOK
--  Schema completo — execute no SQL Editor do Supabase
--  Painel Supabase → SQL Editor → New query → Cole e clique Run
-- ============================================================

-- ─── EXTENSÕES ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id                uuid references auth.users on delete cascade primary key,
  role              text not null default 'creator' check (role in ('creator','admin')),
  full_name         text not null,
  email             text not null,
  phone             text,
  avatar            text,

  -- Auth/Gender
  gender            text check (gender in ('feminino','masculino','outro','prefiro não informar')),
  gender_other      text,

  -- Basic profile
  age_range         text,
  city              text,
  state             text,
  cities_served     text[] default '{}',

  -- Logistics
  accepts_travel    boolean default false,
  max_distance      text,
  has_transport     boolean default false,
  transport_type    text,
  depends_on_others boolean default false,

  -- Social
  instagram         text,
  tiktok            text,
  youtube           text,
  other_social      text,
  followers_range   text,

  -- Content
  niches            text[] default '{}',
  content_types     text[] default '{}',
  no_record         text[] default '{}',
  no_record_note    text,

  -- Availability
  recurring         boolean default false,
  frequency         text,
  delivery_deadline text,
  best_periods      text[] default '{}',

  -- Extra (optional)
  height            text,
  clothing_size     text,
  shoe_size         text,
  extra_notes       text,

  -- Events (only feminine profiles)
  accepts_events    boolean default false,
  event_types       text[] default '{}',
  figurino          text,
  campaign_types    text[] default '{}',
  event_note        text,

  -- Terms
  term_accepted     boolean default false,
  term_accepted_at  timestamptz,

  -- Meta
  profile_pct       int default 0,
  status            text default 'pending' check (status in ('pending','active','inactive')),
  share_code        text unique,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.profiles enable row level security;

-- Policies profiles
create policy "profiles: creator vê o próprio"
  on public.profiles for select to authenticated
  using (id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "profiles: creator insere o próprio"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "profiles: creator atualiza o próprio"
  on public.profiles for update to authenticated
  using (id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── CREATOR PHOTOS ──────────────────────────────────────────
create table public.creator_photos (
  id          uuid default gen_random_uuid() primary key,
  creator_id  uuid references public.profiles(id) on delete cascade not null,
  photo_type  text not null check (photo_type in ('face','body')),
  url         text not null,
  created_at  timestamptz default now()
);

alter table public.creator_photos enable row level security;

create policy "photos: creator vê as próprias"
  on public.creator_photos for select to authenticated
  using (creator_id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "photos: creator insere as próprias"
  on public.creator_photos for insert to authenticated
  with check (creator_id = auth.uid());

create policy "photos: creator deleta as próprias"
  on public.creator_photos for delete to authenticated
  using (creator_id = auth.uid());

-- ─── CREATOR VIDEO LINKS ─────────────────────────────────────
create table public.creator_video_links (
  id          uuid default gen_random_uuid() primary key,
  creator_id  uuid references public.profiles(id) on delete cascade not null,
  url         text not null,
  created_at  timestamptz default now()
);

alter table public.creator_video_links enable row level security;

create policy "video_links: creator vê as próprias"
  on public.creator_video_links for select to authenticated
  using (creator_id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "video_links: creator insere as próprias"
  on public.creator_video_links for insert to authenticated
  with check (creator_id = auth.uid());

create policy "video_links: creator deleta as próprias"
  on public.creator_video_links for delete to authenticated
  using (creator_id = auth.uid());

-- ─── CREATOR CITIES ──────────────────────────────────────────
create table public.creator_cities (
  id          uuid default gen_random_uuid() primary key,
  creator_id  uuid references public.profiles(id) on delete cascade not null,
  city        text not null
);

alter table public.creator_cities enable row level security;

create policy "cities: creator vê as próprias"
  on public.creator_cities for select to authenticated
  using (creator_id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "cities: creator insere as próprias"
  on public.creator_cities for insert to authenticated
  with check (creator_id = auth.uid());

create policy "cities: creator deleta as próprias"
  on public.creator_cities for delete to authenticated
  using (creator_id = auth.uid());

-- ─── JOBS ────────────────────────────────────────────────────
create table public.jobs (
  id           uuid default gen_random_uuid() primary key,
  created_by   uuid references public.profiles(id) not null,
  type         text not null check (type in ('direct','open')),
  title        text not null,
  brand        text not null,
  category     text,
  description  text,
  deliverables text[] default '{}',
  city         text,
  deadline     date,
  value        numeric(12,2),
  observations text,
  status       text default 'open' check (status in ('open','closed')),
  created_at   timestamptz default now()
);

alter table public.jobs enable row level security;

-- Creators veem apenas jobs abertos; admin vê tudo
create policy "jobs: creator vê jobs abertos"
  on public.jobs for select to authenticated
  using (
    status = 'open'
    or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "jobs: admin cria jobs"
  on public.jobs for insert to authenticated
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "jobs: admin atualiza jobs"
  on public.jobs for update to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── JOB INVITES (diretos) ───────────────────────────────────
create table public.job_invites (
  id           uuid default gen_random_uuid() primary key,
  job_id       uuid references public.jobs(id) on delete cascade not null,
  creator_id   uuid references public.profiles(id) on delete cascade not null,
  status       text default 'pending' check (status in ('pending','accepted','refused')),
  responded_at timestamptz,
  created_at   timestamptz default now(),
  constraint unique_invite unique (job_id, creator_id)
);

alter table public.job_invites enable row level security;

-- Creator vê apenas os próprios convites
create policy "invites: creator vê os próprios"
  on public.job_invites for select to authenticated
  using (
    creator_id = auth.uid()
    or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "invites: admin cria convites"
  on public.job_invites for insert to authenticated
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "invites: creator atualiza o próprio (aceitar/recusar)"
  on public.job_invites for update to authenticated
  using (creator_id = auth.uid() or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── BIDS (propostas de jobs abertos) ───────────────────────
create table public.bids (
  id          uuid default gen_random_uuid() primary key,
  job_id      uuid references public.jobs(id) on delete cascade not null,
  creator_id  uuid references public.profiles(id) on delete cascade not null,
  amount      numeric(12,2) not null check (amount > 0),
  note        text,
  created_at  timestamptz default now(),
  constraint unique_bid unique (job_id, creator_id)
);

alter table public.bids enable row level security;

-- Creator vê apenas a própria proposta; admin vê todas
create policy "bids: creator vê a própria"
  on public.bids for select to authenticated
  using (
    creator_id = auth.uid()
    or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "bids: creator envia proposta"
  on public.bids for insert to authenticated
  with check (
    creator_id = auth.uid()
    and exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'creator')
  );

-- ─── EVENT REFERENCES ────────────────────────────────────────
create table public.event_references (
  id         uuid default gen_random_uuid() primary key,
  name       text not null,
  url        text default '#',
  active     boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.event_references enable row level security;

-- Creators autenticadas podem ler referências ativas
create policy "event_refs: creators veem ativas"
  on public.event_references for select to authenticated
  using (active = true or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "event_refs: admin gerencia"
  on public.event_references for all to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── PROFILE SHARES ──────────────────────────────────────────
create table public.profile_shares (
  id          uuid default gen_random_uuid() primary key,
  creator_id  uuid references public.profiles(id) on delete cascade not null,
  created_by  uuid references public.profiles(id) not null,
  code        text unique not null,
  expires_at  timestamptz not null,
  max_views   int default 10,
  view_count  int default 0,
  created_at  timestamptz default now()
);

alter table public.profile_shares enable row level security;

-- Acesso público para leitura por código (clientes sem conta)
create policy "shares: leitura pública por código"
  on public.profile_shares for select
  using (true);

create policy "shares: admin cria"
  on public.profile_shares for insert to authenticated
  with check (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── FUNCTION: increment share view ──────────────────────────
create or replace function public.increment_share_view(share_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.profile_shares
  set view_count = view_count + 1
  where id = share_id;
end;
$$;

-- ─── TRIGGER: updated_at automático em profiles ──────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ─── SEED: Event references padrão ───────────────────────────
insert into public.event_references (name, url, active, sort_order) values
  ('Som Automotivo — Step Sound',      '#', true,  1),
  ('Evento de Corrida — Maringá Run',  '#', true,  2),
  ('Ação Promocional — Posto X',       '#', true,  3),
  ('Ativação de Marca — Loja Y',       '#', false, 4),
  ('Festival Gastronômico — Sabores',  '#', false, 5);

-- ─── STORAGE: creator-photos bucket ──────────────────────────
-- Execute separadamente no painel Storage (ou via SQL abaixo)
-- insert into storage.buckets (id, name, public) values ('creator-photos', 'creator-photos', true);

-- Storage policy (execute após criar o bucket)
-- create policy "storage: creator faz upload na própria pasta"
--   on storage.objects for insert to authenticated
--   with check (bucket_id = 'creator-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- create policy "storage: leitura pública das fotos"
--   on storage.objects for select
--   using (bucket_id = 'creator-photos');
