-- CreateTable
CREATE TABLE `tenant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `logoUrl` VARCHAR(500) NULL,
    `databaseName` VARCHAR(100) NOT NULL,
    `tier` VARCHAR(20) NOT NULL DEFAULT 'basic',
    `maxUsers` INTEGER NOT NULL DEFAULT 5,
    `maxGuests` INTEGER NOT NULL DEFAULT 1000,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Tenant_slug_key`(`slug`),
    UNIQUE INDEX `Tenant_databaseName_key`(`databaseName`),
    INDEX `Tenant_slug_idx`(`slug`),
    INDEX `Tenant_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `role` VARCHAR(30) NOT NULL DEFAULT 'staff',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `phone` VARCHAR(20) NULL,
    `avatarUrl` VARCHAR(500) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_tenantId_email_key`(`tenantId`, `email`),
    INDEX `User_tenantId_idx`(`tenantId`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_isActive_idx`(`isActive`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `User_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default tenant
INSERT INTO `tenant` (`slug`, `name`, `databaseName`, `tier`, `maxUsers`, `maxGuests`, `isActive`, `createdAt`, `updatedAt`)
VALUES ('maiai-default', 'MaiAI Default Salon', 'maiai_crm_1', 'basic', 5, 1000, true, NOW(3), NOW(3));

-- Seed admin user (password: Admin@123)
INSERT INTO `user` (`tenantId`, `email`, `passwordHash`, `name`, `role`, `isActive`, `createdAt`, `updatedAt`)
VALUES (1, 'admin@maiai.com', '$2b$10$bZaGjvf7ZuD5Zkb91eGyW.dFAvQTCAHzURWYbR1lu3Sk.Vt0q4/O2', 'Admin User', 'owner', true, NOW(3), NOW(3));
