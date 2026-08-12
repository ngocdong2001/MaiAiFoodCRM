-- Seed staff + schedule directly in SQL migration (idempotent).
-- This migration ensures key staff records exist and have a 7-day schedule with lunch breaks.

-- 1) Normalize existing rows by staff name so we do not create duplicates with random seed emails.
UPDATE staff
SET email = 'sophia.chen@maiai.local', role = 'nail_tech', status = 'active', updatedAt = NOW()
WHERE name = 'Sophia Chen';

UPDATE staff
SET email = 'james.rodriguez@maiai.local', role = 'nail_tech', status = 'active', updatedAt = NOW()
WHERE name = 'James Rodriguez';

UPDATE staff
SET email = 'emma.watson@maiai.local', role = 'nail_tech', status = 'active', updatedAt = NOW()
WHERE name = 'Emma Watson';

UPDATE staff
SET email = 'sarah.jenkins@maiai.local', role = 'Senior Stylist', status = 'active', updatedAt = NOW()
WHERE name = 'Sarah Jenkins';

UPDATE staff
SET email = 'marcus.chen@maiai.local', role = 'Colorist', status = 'busy', updatedAt = NOW()
WHERE name = 'Marcus Chen';

UPDATE staff
SET email = 'elena.rodriguez@maiai.local', role = 'Junior Stylist', status = 'active', updatedAt = NOW()
WHERE name = 'Elena Rodriguez';

UPDATE staff
SET email = 'david.kim@maiai.local', role = 'Senior Stylist', status = 'on_leave', updatedAt = NOW()
WHERE name = 'David Kim';

-- 2) Insert missing staff only (avoid duplicates when email is not unique in this schema).
INSERT INTO staff (
  name,
  role,
  status,
  phone,
  email,
  avatarUrl,
  hourlyRate,
  commissionRate,
  joinDate,
  createdAt,
  updatedAt
)
SELECT
  'Sophia Chen', 'nail_tech', 'active', '0901000101', 'sophia.chen@maiai.local', NULL, 18.00, 6.00, UTC_DATE(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE name = 'Sophia Chen');

INSERT INTO staff (
  name,
  role,
  status,
  phone,
  email,
  avatarUrl,
  hourlyRate,
  commissionRate,
  joinDate,
  createdAt,
  updatedAt
)
SELECT
  'James Rodriguez', 'nail_tech', 'active', '0901000102', 'james.rodriguez@maiai.local', NULL, 21.00, 8.00, UTC_DATE(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE name = 'James Rodriguez');

INSERT INTO staff (
  name,
  role,
  status,
  phone,
  email,
  avatarUrl,
  hourlyRate,
  commissionRate,
  joinDate,
  createdAt,
  updatedAt
)
SELECT
  'Emma Watson', 'nail_tech', 'active', '0901000103', 'emma.watson@maiai.local', NULL, 22.00, 8.50, UTC_DATE(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE name = 'Emma Watson');

INSERT INTO staff (
  name,
  role,
  status,
  phone,
  email,
  avatarUrl,
  hourlyRate,
  commissionRate,
  joinDate,
  createdAt,
  updatedAt
)
SELECT
  'Sarah Jenkins', 'Senior Stylist', 'active', '0901000001', 'sarah.jenkins@maiai.local', NULL, 28.00, 12.00, UTC_DATE(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE name = 'Sarah Jenkins');

INSERT INTO staff (
  name,
  role,
  status,
  phone,
  email,
  avatarUrl,
  hourlyRate,
  commissionRate,
  joinDate,
  createdAt,
  updatedAt
)
SELECT
  'Marcus Chen', 'Colorist', 'busy', '0901000002', 'marcus.chen@maiai.local', NULL, 26.00, 10.00, UTC_DATE(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE name = 'Marcus Chen');

INSERT INTO staff (
  name,
  role,
  status,
  phone,
  email,
  avatarUrl,
  hourlyRate,
  commissionRate,
  joinDate,
  createdAt,
  updatedAt
)
SELECT
  'Elena Rodriguez', 'Junior Stylist', 'active', '0901000003', 'elena.rodriguez@maiai.local', NULL, 20.00, 8.00, UTC_DATE(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE name = 'Elena Rodriguez');

INSERT INTO staff (
  name,
  role,
  status,
  phone,
  email,
  avatarUrl,
  hourlyRate,
  commissionRate,
  joinDate,
  createdAt,
  updatedAt
)
SELECT
  'David Kim', 'Senior Stylist', 'on_leave', '0901000004', 'david.kim@maiai.local', NULL, 30.00, 15.00, UTC_DATE(), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM staff WHERE name = 'David Kim');

-- 3) Upsert schedule (7 days) for the target staff.
INSERT INTO staffschedule (
  staffId,
  date,
  startTime,
  endTime,
  breakStart,
  breakEnd,
  isDayOff,
  note,
  createdAt,
  updatedAt
)
SELECT
  s.id,
  d.targetDate,
  CASE
    WHEN s.email = 'marcus.chen@maiai.local' THEN '10:00'
    WHEN s.email = 'elena.rodriguez@maiai.local' THEN '09:00'
    WHEN s.email = 'sophia.chen@maiai.local' THEN '08:00'
    ELSE '09:00'
  END AS startTime,
  CASE
    WHEN s.email = 'marcus.chen@maiai.local' THEN '18:00'
    WHEN s.email = 'elena.rodriguez@maiai.local' THEN '14:00'
    ELSE '17:00'
  END AS endTime,
  CASE
    WHEN s.status IN ('inactive', 'on_leave') OR DAYOFWEEK(d.targetDate) = 1 THEN NULL
    WHEN s.email = 'marcus.chen@maiai.local' THEN '12:30'
    WHEN s.email = 'elena.rodriguez@maiai.local' THEN '12:00'
    ELSE '12:00'
  END AS breakStart,
  CASE
    WHEN s.status IN ('inactive', 'on_leave') OR DAYOFWEEK(d.targetDate) = 1 THEN NULL
    WHEN s.email = 'marcus.chen@maiai.local' THEN '13:30'
    WHEN s.email = 'elena.rodriguez@maiai.local' THEN '12:45'
    ELSE '13:00'
  END AS breakEnd,
  CASE
    WHEN s.status IN ('inactive', 'on_leave') OR DAYOFWEEK(d.targetDate) = 1 THEN 1
    ELSE 0
  END AS isDayOff,
  CASE
    WHEN s.email = 'sarah.jenkins@maiai.local' THEN 'Station 1'
    WHEN s.email = 'marcus.chen@maiai.local' THEN 'Color Bar A'
    WHEN s.email = 'elena.rodriguez@maiai.local' THEN 'Station 4'
    WHEN s.email = 'david.kim@maiai.local' THEN 'Station 2'
    WHEN s.email = 'sophia.chen@maiai.local' THEN 'Station 3'
    WHEN s.email = 'james.rodriguez@maiai.local' THEN 'Station 5'
    WHEN s.email = 'emma.watson@maiai.local' THEN 'Station 6'
    ELSE 'Station 1'
  END AS note,
  NOW(),
  NOW()
FROM staff s
JOIN (
  SELECT UTC_DATE() AS targetDate
  UNION ALL SELECT DATE_ADD(UTC_DATE(), INTERVAL 1 DAY)
  UNION ALL SELECT DATE_ADD(UTC_DATE(), INTERVAL 2 DAY)
  UNION ALL SELECT DATE_ADD(UTC_DATE(), INTERVAL 3 DAY)
  UNION ALL SELECT DATE_ADD(UTC_DATE(), INTERVAL 4 DAY)
  UNION ALL SELECT DATE_ADD(UTC_DATE(), INTERVAL 5 DAY)
  UNION ALL SELECT DATE_ADD(UTC_DATE(), INTERVAL 6 DAY)
) d
WHERE s.email IN (
  'sophia.chen@maiai.local',
  'james.rodriguez@maiai.local',
  'emma.watson@maiai.local',
  'sarah.jenkins@maiai.local',
  'marcus.chen@maiai.local',
  'elena.rodriguez@maiai.local',
  'david.kim@maiai.local'
)
ON DUPLICATE KEY UPDATE
  startTime = VALUES(startTime),
  endTime = VALUES(endTime),
  breakStart = VALUES(breakStart),
  breakEnd = VALUES(breakEnd),
  isDayOff = VALUES(isDayOff),
  note = VALUES(note),
  updatedAt = NOW();
