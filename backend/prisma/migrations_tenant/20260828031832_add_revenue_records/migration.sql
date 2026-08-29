-- NOTE: this migration intentionally only adds new tables. Any DROP TABLE/DROP FOREIGN KEY
-- statements suggested by `prisma migrate diff` for `salonsettings`/`user` (schema drift
-- unrelated to this feature) were removed to avoid touching existing data/tables.

-- CreateTable
CREATE TABLE `revenuerecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentId` INTEGER NOT NULL,
    `appointmentId` INTEGER NOT NULL,
    `guestId` INTEGER NOT NULL,
    `guestName` VARCHAR(255) NOT NULL,
    `guestPhone` VARCHAR(20) NULL,
    `guestAvatarUrl` VARCHAR(500) NULL,
    `staffId` INTEGER NULL,
    `staffName` VARCHAR(255) NULL,
    `staffRole` VARCHAR(30) NULL,
    `staffAvatarUrl` VARCHAR(500) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `discountAmount` DECIMAL(10, 2) NOT NULL,
    `tipAmount` DECIMAL(10, 2) NOT NULL,
    `finalAmount` DECIMAL(12, 2) NOT NULL,
    `paymentMethod` VARCHAR(20) NOT NULL,
    `paymentStatus` VARCHAR(20) NOT NULL,
    `receiptNumber` VARCHAR(50) NULL,
    `paidAt` DATETIME(3) NOT NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RevenueRecord_paymentId_key`(`paymentId`),
    INDEX `RevenueRecord_paidAt_idx`(`paidAt`),
    INDEX `RevenueRecord_staffId_idx`(`staffId`),
    INDEX `RevenueRecord_guestId_idx`(`guestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revenuerecorddetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `revenueRecordId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `serviceName` VARCHAR(255) NOT NULL,
    `categoryName` VARCHAR(100) NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    INDEX `RevenueRecordDetail_revenueRecordId_idx`(`revenueRecordId`),
    INDEX `RevenueRecordDetail_serviceId_idx`(`serviceId`),
    UNIQUE INDEX `RevenueRecordDetail_revenueRecordId_serviceId_key`(`revenueRecordId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `revenuerecord` ADD CONSTRAINT `RevenueRecord_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `revenuerecorddetail` ADD CONSTRAINT `RevenueRecordDetail_revenueRecordId_fkey` FOREIGN KEY (`revenueRecordId`) REFERENCES `revenuerecord`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
