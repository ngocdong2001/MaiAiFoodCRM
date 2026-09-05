-- AlterTable
ALTER TABLE `revenuerecord` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'completed',
    ADD COLUMN `cancelReason` VARCHAR(500) NULL,
    ADD COLUMN `cancelReasonStatus` VARCHAR(20) NULL;
