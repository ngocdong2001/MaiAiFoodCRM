-- Docker init: creates required databases for master + default tenant,
-- and grants the `maiai` user multi-tenant privileges (from init-db.sql).

CREATE DATABASE IF NOT EXISTS `maiai_master`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `maiai_crm_1`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `maiai_master`.* TO 'maiai'@'%';
GRANT ALL PRIVILEGES ON `maiai_crm_%`.* TO 'maiai'@'%';
GRANT ALL PRIVILEGES ON `crm_%`.* TO 'maiai'@'%';
GRANT CREATE, DROP, ALTER, INDEX, CREATE TEMPORARY TABLES, LOCK TABLES, REFERENCES ON *.* TO 'maiai'@'%';

FLUSH PRIVILEGES;
