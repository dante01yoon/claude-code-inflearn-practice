-- 관리자 화면(admin.html): 수집 실행 기록과 관리자 목록, 관리자만 부를 수 있는 요약 함수.
-- 수집 기록·관리자 목록은 클라이언트 키로 직접 읽지 못한다(권한 없음). 화면은 admin_dashboard()만 부르고,
-- 이 함수가 호출한 사람이 admin_users에 있는지 확인한 뒤에만 요약을 돌려준다.
--
-- 관리자 지정(SQL 편집기나 psql에서, service_role/postgres로):
--   insert into public.admin_users (user_id) select id from auth.users where email = '관리자@메일';

-- 관리자: 행을 지우면 바로 권한이 없어진다(JWT를 다시 받을 필요 없음).
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table public.admin_users is '관리자 화면에 들어올 수 있는 사용자';

-- 수집 실행 기록: npm run collect가 한 번 돌 때마다 한 행. 쓰기는 service_role(RLS 우회)만 한다.
create table public.collect_runs (
  id          bigint generated always as identity primary key,
  started_at  timestamptz not null,
  finished_at timestamptz not null,
  sample      boolean not null default false,
  api_calls   integer not null default 0 check (api_calls >= 0),   -- 실시간 도시데이터 API에 실제로 보낸 요청 수
  api_failed  integer not null default 0 check (api_failed between 0 and api_calls),
  inserted    integer not null default 0 check (inserted >= 0),    -- crowd_snapshots에 새로 들어간 행
  skipped     integer not null default 0 check (skipped >= 0),     -- 테이블 check에 걸려 뺀 장소
  error       text,                                                 -- 실행 전체가 실패했으면 그 이유(인증키는 가린 뒤)
  api_errors  jsonb not null default '[]'::jsonb,                   -- 실패한 장소 일부 [{ code, message }]
  constraint collect_runs_time_order check (finished_at >= started_at)
);
comment on table public.collect_runs is '도시데이터 수집 실행 기록(scripts/collect-citydata.mjs)';
create index collect_runs_started_at_idx on public.collect_runs (started_at desc);

alter table public.admin_users enable row level security;
alter table public.collect_runs enable row level security;
-- 정책을 두지 않고 권한도 거둔다: anon·authenticated는 두 테이블을 전혀 읽고 쓰지 못한다.
revoke all on public.admin_users, public.collect_runs from anon, authenticated;

-- 지금 로그인한 사용자가 관리자인지. admin_users를 읽어야 하므로 security definer.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

-- 관리자 화면 요약. 관리자가 아니면 42501(권한 없음)로 실패한다.
-- 시간대 묶음은 KST 정시 기준, 최근 24시간(지금 시간대 포함 24칸).
create function public.admin_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  now_kst timestamp := now() at time zone 'Asia/Seoul';
  first_hour timestamp := date_trunc('hour', now() at time zone 'Asia/Seoul') - interval '23 hours';
begin
  if not public.is_admin() then
    raise exception '관리자만 볼 수 있습니다' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'generated_at', now(),
    'collector', jsonb_build_object(
      'last_run', (select to_jsonb(r) - 'api_errors' from public.collect_runs r order by started_at desc limit 1),
      -- 실행 전체 오류 없이 한 곳이라도 받은 마지막 실행
      'last_ok_at', (select max(finished_at) from public.collect_runs where error is null and api_calls > api_failed),
      'last_fetched_at', (select max(fetched_at) from public.crowd_snapshots),
      'last_observed_at', (select max(observed_at) from public.crowd_snapshots),
      'places_total', (select count(*) from public.places),
      'places_last_hour', (select count(distinct place_code) from public.crowd_snapshots where observed_at >= now() - interval '1 hour'),
      'snapshots_total', (select count(*) from public.crowd_snapshots),
      'snapshots_24h', (select count(*) from public.crowd_snapshots where fetched_at >= now() - interval '24 hours')
    ),
    'totals', (
      select jsonb_build_object(
        'runs_24h', count(*) filter (where started_at >= now() - interval '24 hours'),
        'run_errors_24h', count(*) filter (where started_at >= now() - interval '24 hours' and error is not null),
        'calls_24h', coalesce(sum(api_calls) filter (where started_at >= now() - interval '24 hours'), 0),
        'failed_24h', coalesce(sum(api_failed) filter (where started_at >= now() - interval '24 hours'), 0),
        'inserted_24h', coalesce(sum(inserted) filter (where started_at >= now() - interval '24 hours'), 0),
        'calls_7d', coalesce(sum(api_calls), 0),
        'failed_7d', coalesce(sum(api_failed), 0)
      )
      from public.collect_runs where started_at >= now() - interval '7 days'
    ),
    'hourly', (
      select jsonb_agg(jsonb_build_object(
               'hour', to_char(h.hour, 'YYYY-MM-DD"T"HH24:MI'),
               'runs', coalesce(c.runs, 0), 'run_errors', coalesce(c.run_errors, 0),
               'calls', coalesce(c.calls, 0), 'failed', coalesce(c.failed, 0), 'inserted', coalesce(c.inserted, 0))
             order by h.hour)
      from generate_series(first_hour, date_trunc('hour', now_kst), interval '1 hour') as h (hour)
      left join (
        select date_trunc('hour', started_at at time zone 'Asia/Seoul') as hour,
               count(*) as runs, count(*) filter (where error is not null) as run_errors,
               sum(api_calls) as calls, sum(api_failed) as failed, sum(inserted) as inserted
        from public.collect_runs
        where started_at at time zone 'Asia/Seoul' >= first_hour
        group by 1
      ) c on c.hour = h.hour
    ),
    'recent_runs', coalesce((
      select jsonb_agg(to_jsonb(r) - 'api_errors' order by r.started_at desc)
      from (select * from public.collect_runs order by started_at desc limit 20) r
    ), '[]'::jsonb),
    -- 최근 24시간에 자주 난 오류(실행 전체 오류와 장소별 API 오류를 같은 문구끼리 묶음)
    'top_errors', coalesce((
      select jsonb_agg(jsonb_build_object('message', message, 'count', n, 'last_at', last_at) order by n desc, last_at desc)
      from (
        select message, count(*) as n, max(at) as last_at
        from (
          select error as message, started_at as at from public.collect_runs
          where error is not null and started_at >= now() - interval '24 hours'
          union all
          select e ->> 'message', r.started_at from public.collect_runs r, jsonb_array_elements(r.api_errors) e
          where r.started_at >= now() - interval '24 hours'
        ) all_errors
        group by message
        order by n desc, last_at desc
        limit 5
      ) top
    ), '[]'::jsonb),
    'users', jsonb_build_object(
      'total', (select count(*) from auth.users),
      'new_7d', (select count(*) from auth.users where created_at >= now() - interval '7 days'),
      'active_7d', (select count(*) from auth.users where last_sign_in_at >= now() - interval '7 days'),
      'with_favorites', (select count(*) from (select user_id from public.favorites union select user_id from public.favorite_stations) u),
      'with_alerts', (select count(*) from (
          select user_id from public.favorites where notify_level is not null
          union select user_id from public.favorite_stations where notify_ratio is not null) u),
      'admins', (select count(*) from public.admin_users)
    )
  );
end;
$$;

-- 관리자 확인은 함수 안(is_admin)에서 한다. 익명은 auth.uid()가 null이라 늘 42501로 거절된다.
-- anon의 실행 권한을 거두지 않는 이유: 로컬 Supabase 이미지(PostgreSQL 17.6)에서 실행 권한이 없는 함수를 부르면
-- 백엔드가 세그폴트로 죽고 DB 전체가 재시작된다(2026-10-12 확인). 권한을 거두면 누구나 익명 rpc 한 번으로 DB를 재시작시킬 수 있다.
grant execute on function public.is_admin(), public.admin_dashboard() to anon, authenticated;
