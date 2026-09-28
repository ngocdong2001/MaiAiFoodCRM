CREATE TABLE `notification` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(50) NOT NULL DEFAULT 'appointment.created',
  `appointmentId` INTEGER NOT NULL,
  `guestName` VARCHAR(255) NOT NULL,
  `staffName` VARCHAR(255) NOT NULL,
  `serviceNames` JSON NOT NULL,
  `startTime` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `readAt` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `Notification_createdAt_idx` (`createdAt`),
  INDEX `Notification_readAt_idx` (`readAt`),
  INDEX `Notification_appointmentId_idx` (`appointmentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;