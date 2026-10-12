-- 로컬 시험용 데이터. `npx supabase db reset`이 마이그레이션 다음에 넣는다(config.toml [db.seed]).
-- 배포 DB에는 넣지 않는다. 여러 번 실행해도 되게 모두 on conflict do nothing.
--
-- 테스트 사용자 두 명. 화면에서는 이메일을 넣고 Mailpit(http://127.0.0.1:54424)에 온 6자리 코드로 로그인한다.
-- 비밀번호(test1234)는 화면에 쓰는 곳이 없고, 스크립트로 RLS를 확인할 때 /auth/v1/token?grant_type=password로 토큰을 받는 데 쓴다.
--   tester1@example.com: 알림을 켠 역 2곳·장소 2곳(광화문·덕수궁은 sample 키로도 실시간 값이 와서 장소 알림을 볼 수 있다)
--   tester2@example.com: 알림을 끈 역 1곳·장소 1곳. tester1의 즐겨찾기가 보이지 않는지(RLS) 확인할 때 쓴다.
--   admin@example.com: 관리자(admin_users). 관리자 화면(admin.html)에 들어갈 수 있다. tester1·2는 들어가지 못한다.

-- 사용자. GoTrue는 토큰 열이 null이면 로그인에서 오류를 내므로 빈 문자열로 둔다.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
       extensions.crypt('test1234', extensions.gen_salt('bf')), now(),
       '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
       '', '', '', ''
from (values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'tester1@example.com'),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'tester2@example.com'),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'admin@example.com')
) as u (id, email)
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select u.id::text, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now()
from auth.users u
where u.email in ('tester1@example.com', 'tester2@example.com', 'admin@example.com')
on conflict (provider_id, provider) do nothing;

-- 장소 즐겨찾기가 참조하는 장소. 나머지는 수집기(npm run collect)가 영역 zip으로 채우고 이름·분류도 맞춘다.
insert into public.places (code, name, category) values
  ('POI007', '홍대 관광특구', '관광특구'),
  ('POI009', '광화문·덕수궁', '고궁·문화유산'),
  ('POI014', '강남역', '인구밀집지역')
on conflict (code) do nothing;

-- 역명은 승하차 CSV 표기(환승역은 노선 합산 한 항목)를 그대로 쓴다.
insert into public.favorite_stations (user_id, station_name, notify_ratio) values
  ('11111111-1111-4111-8111-111111111111', '가산디지털단지', 60),
  ('11111111-1111-4111-8111-111111111111', '강남', 80),
  ('22222222-2222-4222-8222-222222222222', '잠실(송파구청)', null)
on conflict (user_id, station_name) do nothing;

insert into public.favorites (user_id, place_code, notify_level) values
  ('11111111-1111-4111-8111-111111111111', 'POI009', '보통'),
  ('11111111-1111-4111-8111-111111111111', 'POI014', '붐빔'),
  ('22222222-2222-4222-8222-222222222222', 'POI007', null)
on conflict (user_id, place_code) do nothing;

insert into public.admin_users (user_id) values
  ('33333333-3333-4333-8333-333333333333')
on conflict (user_id) do nothing;
