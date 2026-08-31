-- AlterTable
ALTER TABLE `callanalysis` ADD COLUMN `errorMessage` TEXT NULL,
    ADD COLUMN `errorCode` VARCHAR(100) NULL,
    ADD COLUMN `errorDetails` TEXT NULL,
    ADD COLUMN `deepgramError` TEXT NULL,
    ADD COLUMN `ttsError` TEXT NULL;
