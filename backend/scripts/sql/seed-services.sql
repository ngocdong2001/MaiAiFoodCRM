-- Seed service catalog for the default tenant database (maiai_crm).
-- Idempotent: re-running updates existing rows instead of duplicating them.

INSERT INTO servicecategory (name, description, icon, sortOrder, isActive, createdAt, updatedAt) VALUES
  ('Hair',      'Cuts, styling, coloring and treatments',      'scissors', 1, 1, NOW(3), NOW(3)),
  ('Nails',     'Manicure, pedicure, gel and nail art',        'sparkles', 2, 1, NOW(3), NOW(3)),
  ('Spa',       'Massage, facials and body relaxation',        'flower',   3, 1, NOW(3), NOW(3)),
  ('Skincare',  'Facial treatments and skin consultations',    'droplet',  4, 1, NOW(3), NOW(3)),
  ('Makeup',    'Event, bridal and everyday makeup',           'brush',    5, 1, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  icon        = VALUES(icon),
  sortOrder   = VALUES(sortOrder),
  isActive    = VALUES(isActive),
  updatedAt   = NOW(3);

INSERT INTO service (name, description, price, durationMinutes, categoryId, imageUrl, isActive, sortOrder, createdAt, updatedAt)
SELECT s.name, s.description, s.price, s.durationMinutes, c.id, s.imageUrl, s.isActive, s.sortOrder, NOW(3), NOW(3)
FROM (
  SELECT 'Signature Haircut'      AS name, 'Consultation, wash, precision cut and blow-dry finish.'        AS description,  45.00 AS price,  60 AS durationMinutes, 'Hair'     AS categoryName, NULL AS imageUrl, 1 AS isActive, 1 AS sortOrder
  UNION ALL SELECT 'Full Balayage',      'Hand-painted balayage with gloss and toner.',                    185.00, 180, 'Hair',     NULL, 1, 2
  UNION ALL SELECT 'Keratin Treatment',  'Frizz-reducing smoothing treatment lasting up to 3 months.',      150.00, 120, 'Hair',     NULL, 1, 3
  UNION ALL SELECT 'Blow-dry & Style',   'Wash and professional blow-dry styling.',                          35.00,  45, 'Hair',     NULL, 1, 4
  UNION ALL SELECT 'Classic Manicure',   'Shaping, cuticle care, buffing and regular polish.',               28.00,  40, 'Nails',    NULL, 1, 1
  UNION ALL SELECT 'Gel Manicure',       'Long-lasting gel colour with cuticle treatment.',                  42.00,  60, 'Nails',    NULL, 1, 2
  UNION ALL SELECT 'Deluxe Pedicure',    'Exfoliating soak, callus care, massage and polish.',               55.00,  75, 'Nails',    NULL, 1, 3
  UNION ALL SELECT 'Nail Art Add-on',    'Custom hand-painted design, priced per two nails.',                15.00,  20, 'Nails',    NULL, 1, 4
  UNION ALL SELECT 'Swedish Massage',    'Full-body relaxation massage with warm oils.',                     90.00,  60, 'Spa',      NULL, 1, 1
  UNION ALL SELECT 'Deep Tissue Massage','Targeted pressure work for tension and knots.',                   110.00,  75, 'Spa',      NULL, 1, 2
  UNION ALL SELECT 'Hot Stone Therapy',  'Heated basalt stones to release deep muscle tension.',            125.00,  90, 'Spa',      NULL, 1, 3
  UNION ALL SELECT 'Hydrating Facial',   'Cleanse, exfoliation, mask and hydrating serum.',                  75.00,  60, 'Skincare', NULL, 1, 1
  UNION ALL SELECT 'Anti-Ageing Facial', 'Peptide and vitamin C treatment with LED therapy.',               120.00,  75, 'Skincare', NULL, 1, 2
  UNION ALL SELECT 'Acne Clarifying Peel','Chemical peel for congested and acne-prone skin.',                95.00,  50, 'Skincare', NULL, 1, 3
  UNION ALL SELECT 'Bridal Makeup',      'Trial plus wedding-day application with lashes.',                 220.00, 120, 'Makeup',   NULL, 1, 1
  UNION ALL SELECT 'Evening Glam',       'Full-glam event makeup with strip lashes.',                        85.00,  60, 'Makeup',   NULL, 1, 2
  UNION ALL SELECT 'Lash Extensions',    'Classic individual lash extension full set.',                     130.00,  90, 'Makeup',   NULL, 0, 3
) AS s
JOIN servicecategory c ON c.name = s.categoryName
WHERE NOT EXISTS (SELECT 1 FROM service e WHERE e.name = s.name);
