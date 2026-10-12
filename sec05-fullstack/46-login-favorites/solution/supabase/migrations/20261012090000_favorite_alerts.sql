-- 즐겨찾기 알림 기준과 "내 역" 즐겨찾기.
-- 장소 알림은 실시간 도시데이터 혼잡도가 고른 단계 이상이면, 역 알림은 지금 시간대 승하차(9월 통계)가 그 역 피크의 고른 비율 이상이면 울린다.
-- 판단은 브라우저(alerts.mjs)가 페이지가 열려 있는 동안 한다. DB에는 무엇을 어떤 기준으로 볼지만 둔다. null = 알림 끔.

alter table public.favorites
  add column notify_level text default '약간 붐빔'
    check (notify_level in ('보통', '약간 붐빔', '붐빔'));
comment on column public.favorites.notify_level is '이 혼잡도 단계 이상이면 알림(null = 끔)';

-- 내 역: 역은 DB에 없고 승하차 CSV의 역명(환승역은 노선 합산 한 항목)으로 가리킨다.
create table public.favorite_stations (
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  station_name text not null check (char_length(station_name) between 1 and 50),
  notify_ratio smallint default 60 check (notify_ratio between 10 and 100),
  created_at   timestamptz not null default now(),
  primary key (user_id, station_name)
);
comment on table public.favorite_stations is '사용자별 즐겨찾기 역(승하차 CSV의 역명)';
comment on column public.favorite_stations.notify_ratio is '지금 시간대 하루 평균이 이 역 피크의 몇 % 이상이면 알림(null = 끔)';

alter table public.favorite_stations enable row level security;

create policy "본인 즐겨찾기 알림 기준을 고친다" on public.favorites
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "본인 즐겨찾기 역을 읽는다" on public.favorite_stations
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "본인 즐겨찾기 역을 추가한다" on public.favorite_stations
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "본인 즐겨찾기 역의 알림 기준을 고친다" on public.favorite_stations
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "본인 즐겨찾기 역을 지운다" on public.favorite_stations
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 고칠 수 있는 열은 알림 기준뿐이다.
revoke all on public.favorite_stations from anon, authenticated;
grant select, insert, delete on public.favorite_stations to authenticated;
grant update (notify_ratio) on public.favorite_stations to authenticated;
grant update (notify_level) on public.favorites to authenticated;
