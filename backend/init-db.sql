-- Grant maiai user full privileges for multi-tenant database creation
-- This allows the tenant provisioning API to CREATE DATABASE for new tenants
-- and run migrations with foreign keys
-- NOTE: Only runs on FIRST container start (when volume is empty).

CREATE DATABASE IF NOT EXISTS `maiai_master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `maiai_master`.* TO 'maiai'@'%';
GRANT ALL PRIVILEGES ON `maiai_crm`.* TO 'maiai'@'%';
GRANT ALL PRIVILEGES ON `maiai_crm_%`.* TO 'maiai'@'%';
GRANT ALL PRIVILEGES ON `crm_%`.* TO 'maiai'@'%';
GRANT CREATE, DROP, ALTER, INDEX, CREATE TEMPORARY TABLES, LOCK TABLES, REFERENCES ON *.* TO 'maiai'@'%';

FLUSH PRIVILEGES;