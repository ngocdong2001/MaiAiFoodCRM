-- Create MaiAICRM databases
CREATE DATABASE IF NOT EXISTS maiai_master DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS maiai_crm DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grant permissions to maiai user
GRANT ALL PRIVILEGES ON maiai_master.* TO 'maiai'@'%';
GRANT ALL PRIVILEGES ON maiai_crm.* TO 'maiai'@'%';
GRANT ALL PRIVILEGES ON `maiai_crm_%`.* TO 'maiai'@'%';
GRANT ALL PRIVILEGES ON `crm_%`.* TO 'maiai'@'%';
GRANT CREATE, DROP, ALTER, INDEX, CREATE TEMPORARY TABLES, LOCK TABLES, REFERENCES ON *.* TO 'maiai'@'%';

FLUSH PRIVILEGES;
