-- 서울시 주요 121장소, 장소별 붐빔 기록(실시간 도시데이터 citydata_ppltn), 사용자 즐겨찾기.
-- places·crowd_snapshots는 누구나 읽고, 쓰기는 서버(service_role)만 한다. favorites는 본인 행만 읽고 쓴다.

-- 장소: 영역 zip(.dbf)의 AREA_CD·AREA_NM·CATEGORY
create table public.places (
  code       text primary key check (code ~ '^POI[0-9]{3}$'),
  name       text not null unique,
  category   text not null,
  created_at timestamptz not null default now()
);
comment on table public.places is '서울시 주요 121장소(영역 zip의 AREA_CD·AREA_NM·CATEGORY)';

-- 붐빔 기록: API가 5분마다 갱신하는 장소별 인구 범위·혼잡도를 그 시각마다 한 행씩
create table public.crowd_snapshots (
  id             bigint generated always as identity primary key,
  place_code     text not null references public.places (code) on update cascade on delete cascade,
  observed_at    timestamptz not null,
  congest_level  text not null check (congest_level in ('여유', '보통', '약간 붐빔', '붐빔')),
  population_min integer check (population_min >= 0),
  population_max integer check (population_max >= 0),
  message        text,
  fetched_at     timestamptz not null default now(),
  constraint crowd_snapshots_population_range check (population_min <= population_max),
  constraint crowd_snapshots_place_time_key unique (place_code, observed_at)
);
comment on table public.crowd_snapshots is '장소별 붐빔 기록(citydata_ppltn의 PPLTN_TIME·AREA_CONGEST_LVL·AREA_PPLTN_MIN/MAX)';
comment on column public.crowd_snapshots.observed_at is 'API의 PPLTN_TIME(KST)을 timestamptz로';
-- unique (place_code, observed_at) 인덱스가 장소별 최근 기록 조회도 맡는다.
create index crowd_snapshots_observed_at_idx on public.crowd_snapshots (observed_at desc);

-- 즐겨찾기: 로그인한 사용자가 장소를 저장
create table public.favorites (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  place_code text not null references public.places (code) on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_code)
);
comment on table public.favorites is '사용자별 즐겨찾기 장소';
create index favorites_place_code_idx on public.favorites (place_code);

-- RLS
alter table public.places enable row level security;
alter table public.crowd_snapshots enable row level security;
alter table public.favorites enable row level security;

create policy "누구나 장소를 읽는다" on public.places
  for select to anon, authenticated using (true);

create policy "누구나 붐빔 기록을 읽는다" on public.crowd_snapshots
  for select to anon, authenticated using (true);

create policy "본인 즐겨찾기를 읽는다" on public.favorites
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "본인 즐겨찾기를 추가한다" on public.favorites
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "본인 즐겨찾기를 지운다" on public.favorites
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 클라이언트 키로는 읽기만(즐겨찾기는 추가·삭제까지). 쓰기는 service_role이 RLS를 우회해서 한다.
revoke all on public.places, public.crowd_snapshots, public.favorites from anon, authenticated;
grant select on public.places, public.crowd_snapshots to anon, authenticated;
grant select, insert, delete on public.favorites to authenticated;
