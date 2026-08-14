-- Seed runtime revenue labels/colors into SQL settings so API responses stay dynamic.

INSERT INTO setting (`key`, `value`, `group`, `dataType`, `label`, `updatedAt`) VALUES
  ('payment_method_label.cash', 'Cash', 'revenue', 'string', 'Payment method label: cash', NOW()),
  ('payment_method_label.transfer', 'Bank Transfer', 'revenue', 'string', 'Payment method label: transfer', NOW()),
  ('payment_method_label.card', 'Card (POS)', 'revenue', 'string', 'Payment method label: card', NOW()),
  ('payment_method_label.ewallet', 'E-Wallet', 'revenue', 'string', 'Payment method label: ewallet', NOW()),
  ('payment_method_label.loyalty_points', 'Loyalty Points', 'revenue', 'string', 'Payment method label: loyalty_points', NOW()),
  ('payment_method_color.cash', '#F04CAC', 'revenue', 'string', 'Payment method color: cash', NOW()),
  ('payment_method_color.transfer', '#00CBC3', 'revenue', 'string', 'Payment method color: transfer', NOW()),
  ('payment_method_color.card', '#EEBC4A', 'revenue', 'string', 'Payment method color: card', NOW()),
  ('payment_method_color.ewallet', '#4F8BFF', 'revenue', 'string', 'Payment method color: ewallet', NOW()),
  ('payment_method_color.loyalty_points', '#8A4CE0', 'revenue', 'string', 'Payment method color: loyalty_points', NOW()),
  ('activity.payment_via_prefix', 'Payment via', 'revenue', 'string', 'Revenue activity prefix', NOW()),
  ('activity.walk_in_guest', 'Walk-in Guest', 'revenue', 'string', 'Revenue activity walk-in label', NOW())
ON DUPLICATE KEY UPDATE
  `value` = VALUES(`value`),
  `group` = VALUES(`group`),
  `dataType` = VALUES(`dataType`),
  `label` = VALUES(`label`),
  `updatedAt` = NOW();
