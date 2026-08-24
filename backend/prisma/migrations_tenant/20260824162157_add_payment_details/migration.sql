-- Non-destructive migration: adds payment_details support only.
-- NOTE: prisma migrate dev would also try to DROP `salonsettings` and `user`
-- (pre-existing schema drift unrelated to this change) — that step was
-- intentionally removed. This migration only adds the new table.

-- CreateTable
CREATE TABLE `paymentdetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `paymentId` INTEGER NOT NULL,
    `serviceId` INTEGER NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentDetail_paymentId_idx`(`paymentId`),
    INDEX `PaymentDetail_serviceId_idx`(`serviceId`),
    UNIQUE INDEX `PaymentDetail_paymentId_serviceId_key`(`paymentId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `paymentdetail` ADD CONSTRAINT `PaymentDetail_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paymentdetail` ADD CONSTRAINT `PaymentDetail_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
