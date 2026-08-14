-- Grant maiai user full privileges for multi-tenant database creation
-- This allows the tenant provisioning API to CREATE DATABASE for new tenants
-- and run migrations with foreign keys

GRANT ALL PRIVILEGES ON `maiai_master`.* TO 'maiai' @'%';

GRANT ALL PRIVILEGES ON `maiai_crm_%`.* TO 'maiai' @'%';

GRANT CREATE,
DROP,
ALTER,
INDEX,
CREATE TEMPORARY TABLES,
LOCK TABLES,
REFERENCES ON *.* TO 'maiai' @'%';

FLUSH PRIVILEGES;