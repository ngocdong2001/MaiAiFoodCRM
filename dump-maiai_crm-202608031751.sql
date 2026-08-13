/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: maiai_crm
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('2cd63ec7-f585-4b92-9235-0ad640c54d57','5070d4ceb24561f270666e22c8647463f9049a5eddd162b6944636dd1f2a268a','2026-08-03 10:12:57.980','20260803000100_init_crm','',NULL,'2026-08-03 10:12:57.980',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `airecommendation`
--

DROP TABLE IF EXISTS `airecommendation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `airecommendation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guestId` int(11) NOT NULL,
  `appointmentId` int(11) DEFAULT NULL,
  `campaignId` int(11) DEFAULT NULL,
  `serviceId` int(11) NOT NULL,
  `reason` varchar(50) NOT NULL,
  `confidence` decimal(5,2) DEFAULT NULL,
  `potentialRevenue` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'suggested',
  `presentedAt` datetime(3) DEFAULT NULL,
  `resolvedAt` datetime(3) DEFAULT NULL,
  `resolvedBy` varchar(100) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `AIRecommendation_appointmentId_key` (`appointmentId`),
  KEY `AIRecommendation_guestId_idx` (`guestId`),
  KEY `AIRecommendation_status_idx` (`status`),
  KEY `AIRecommendation_campaignId_idx` (`campaignId`),
  KEY `AIRecommendation_serviceId_fkey` (`serviceId`),
  CONSTRAINT `AIRecommendation_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointment` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `AIRecommendation_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `upsellcampaign` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `AIRecommendation_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `guest` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `AIRecommendation_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airecommendation`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `airecommendation` WRITE;
/*!40000 ALTER TABLE `airecommendation` DISABLE KEYS */;
/*!40000 ALTER TABLE `airecommendation` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `appointment`
--

DROP TABLE IF EXISTS `appointment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guestId` int(11) NOT NULL,
  `staffId` int(11) NOT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `priority` varchar(10) NOT NULL DEFAULT 'normal',
  `source` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `cancelReason` text DEFAULT NULL,
  `createdBy` varchar(100) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Appointment_guestId_idx` (`guestId`),
  KEY `Appointment_staffId_idx` (`staffId`),
  KEY `Appointment_startTime_idx` (`startTime`),
  KEY `Appointment_status_idx` (`status`),
  CONSTRAINT `Appointment_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `guest` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Appointment_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staff` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `appointment` WRITE;
/*!40000 ALTER TABLE `appointment` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `appointmentservice`
--

DROP TABLE IF EXISTS `appointmentservice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointmentservice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointmentId` int(11) NOT NULL,
  `serviceId` int(11) NOT NULL,
  `staffId` int(11) DEFAULT NULL,
  `priceAtBooking` decimal(10,2) NOT NULL,
  `durationAtBooking` int(11) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  UNIQUE KEY `AppointmentService_appointmentId_serviceId_key` (`appointmentId`,`serviceId`),
  KEY `AppointmentService_appointmentId_idx` (`appointmentId`),
  KEY `AppointmentService_serviceId_idx` (`serviceId`),
  KEY `AppointmentService_staffId_fkey` (`staffId`),
  CONSTRAINT `AppointmentService_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AppointmentService_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `AppointmentService_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointmentservice`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `appointmentservice` WRITE;
/*!40000 ALTER TABLE `appointmentservice` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointmentservice` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `auditlog`
--

DROP TABLE IF EXISTS `auditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditlog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `entityType` varchar(50) NOT NULL,
  `entityId` int(11) NOT NULL,
  `action` varchar(20) NOT NULL,
  `oldValues` text DEFAULT NULL,
  `newValues` text DEFAULT NULL,
  `performedBy` varchar(100) NOT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `AuditLog_entityType_entityId_idx` (`entityType`,`entityId`),
  KEY `AuditLog_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditlog`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `auditlog` WRITE;
/*!40000 ALTER TABLE `auditlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditlog` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `guest`
--

DROP TABLE IF EXISTS `guest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `avatarUrl` varchar(500) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `totalVisits` int(11) NOT NULL DEFAULT 0,
  `totalSpend` decimal(12,2) NOT NULL DEFAULT 0.00,
  `loyaltyPoints` int(11) NOT NULL DEFAULT 0,
  `memberSince` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Guest_phone_key` (`phone`),
  UNIQUE KEY `Guest_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `guest` WRITE;
/*!40000 ALTER TABLE `guest` DISABLE KEYS */;
INSERT INTO `guest` VALUES
(1,'Test Guest','0900000001','test.guest@example.com',NULL,'female',NULL,1,150000.00,15,'2026-07-31 02:59:11.241',1,NULL,'2026-07-31 02:59:11.241','2026-07-31 02:59:11.241');
/*!40000 ALTER TABLE `guest` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `guestnote`
--

DROP TABLE IF EXISTS `guestnote`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guestnote` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guestId` int(11) NOT NULL,
  `content` text NOT NULL,
  `author` varchar(100) DEFAULT NULL,
  `isPinned` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `GuestNote_guestId_idx` (`guestId`),
  CONSTRAINT `GuestNote_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `guest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guestnote`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `guestnote` WRITE;
/*!40000 ALTER TABLE `guestnote` DISABLE KEYS */;
/*!40000 ALTER TABLE `guestnote` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `guesttag`
--

DROP TABLE IF EXISTS `guesttag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guesttag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `GuestTag_name_key` (`name`),
  KEY `GuestTag_name_idx` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guesttag`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `guesttag` WRITE;
/*!40000 ALTER TABLE `guesttag` DISABLE KEYS */;
INSERT INTO `guesttag` VALUES
(1,'VIP','#FFD700','crown',1,1,'2026-07-31 03:01:13.237','2026-08-03 07:51:20.336'),
(2,'Thuong xuyen','#4CAF50','repeat',1,2,'2026-07-31 03:01:13.261','2026-08-03 07:51:20.363'),
(3,'Khach moi','#2196F3','sparkles',1,3,'2026-07-31 03:01:13.265','2026-08-03 07:51:20.367'),
(4,'Sinh nhat thang nay','#FF5722','cake',1,4,'2026-07-31 03:01:13.269','2026-08-03 07:51:20.371'),
(5,'Than thiet','#9C27B0','heart',1,5,'2026-07-31 03:01:13.272','2026-08-03 07:51:20.375'),
(6,'Can theo doi','#FF9800','alert-triangle',1,6,'2026-07-31 03:01:13.276','2026-08-03 07:51:20.379');
/*!40000 ALTER TABLE `guesttag` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `guesttagmapping`
--

DROP TABLE IF EXISTS `guesttagmapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guesttagmapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guestId` int(11) NOT NULL,
  `tagId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `GuestTagMapping_guestId_tagId_key` (`guestId`,`tagId`),
  KEY `GuestTagMapping_guestId_idx` (`guestId`),
  KEY `GuestTagMapping_tagId_idx` (`tagId`),
  CONSTRAINT `GuestTagMapping_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `guest` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `GuestTagMapping_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `guesttag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guesttagmapping`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `guesttagmapping` WRITE;
/*!40000 ALTER TABLE `guesttagmapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `guesttagmapping` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appointmentId` int(11) NOT NULL,
  `guestId` int(11) NOT NULL,
  `staffId` int(11) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `discountAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tipAmount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `finalAmount` decimal(12,2) NOT NULL,
  `paymentMethod` varchar(20) NOT NULL,
  `paymentStatus` varchar(20) NOT NULL DEFAULT 'paid',
  `paidAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `receiptNumber` varchar(50) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_appointmentId_key` (`appointmentId`),
  UNIQUE KEY `Payment_receiptNumber_key` (`receiptNumber`),
  KEY `Payment_guestId_idx` (`guestId`),
  KEY `Payment_paidAt_idx` (`paidAt`),
  KEY `Payment_paymentMethod_idx` (`paymentMethod`),
  KEY `Payment_staffId_fkey` (`staffId`),
  CONSTRAINT `Payment_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointment` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Payment_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `guest` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Payment_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `refund`
--

DROP TABLE IF EXISTS `refund`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `refund` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `paymentId` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` text NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `approvedBy` varchar(100) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Refund_paymentId_idx` (`paymentId`),
  CONSTRAINT `Refund_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payment` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refund`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `refund` WRITE;
/*!40000 ALTER TABLE `refund` DISABLE KEYS */;
/*!40000 ALTER TABLE `refund` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `durationMinutes` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `imageUrl` varchar(500) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Service_categoryId_idx` (`categoryId`),
  CONSTRAINT `Service_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `servicecategory` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `servicecategory`
--

DROP TABLE IF EXISTS `servicecategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `servicecategory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ServiceCategory_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servicecategory`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `servicecategory` WRITE;
/*!40000 ALTER TABLE `servicecategory` DISABLE KEYS */;
INSERT INTO `servicecategory` VALUES
(1,'Son Gel',NULL,'nail-polish',1,1,'2026-07-31 03:01:13.310','2026-08-03 07:51:21.466'),
(2,'Mong Acrylic',NULL,'sparkles',2,1,'2026-07-31 03:01:13.317','2026-08-03 07:51:21.471'),
(3,'Nail Art',NULL,'palette',3,1,'2026-07-31 03:01:13.320','2026-08-03 07:51:21.475'),
(4,'Cham soc',NULL,'hand-heart',4,1,'2026-07-31 03:01:13.323','2026-08-03 07:51:21.479'),
(5,'Repair & Bo sung',NULL,'wrench',5,1,'2026-07-31 03:01:13.327','2026-08-03 07:51:21.484');
/*!40000 ALTER TABLE `servicecategory` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `setting`
--

DROP TABLE IF EXISTS `setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text NOT NULL,
  `group` varchar(50) NOT NULL,
  `dataType` varchar(10) NOT NULL DEFAULT 'string',
  `label` varchar(255) DEFAULT NULL,
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Setting_key_key` (`key`),
  KEY `Setting_group_idx` (`group`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;
INSERT INTO `setting` VALUES
(1,'business_name','\"NailAI Salon\"','business','string','Ten tiem','2026-08-03 07:51:21.488'),
(2,'business_phone','\"\"','business','string','So dien thoai','2026-08-03 07:51:21.493'),
(3,'business_address','\"\"','business','string','Dia chi','2026-08-03 07:51:21.496'),
(4,'currency','\"VND\"','business','string','Don vi tien te','2026-08-03 07:51:21.501'),
(5,'opening_hour','\"08:00\"','hours','string','Gio mo cua','2026-08-03 07:51:21.505'),
(6,'closing_hour','\"20:00\"','hours','string','Gio dong cua','2026-08-03 07:51:21.509'),
(7,'appointment_duration_slot','\"30\"','business','number','Khung gio dat (phut)','2026-08-03 07:51:21.513'),
(8,'ai_enabled','\"true\"','ai','boolean','Bat goi y AI','2026-08-03 07:51:21.517'),
(9,'ai_confidence_threshold','\"70\"','ai','number','Nguong tin cay toi thieu (%)','2026-08-03 07:51:21.521'),
(10,'loyalty_points_per_100k','\"10\"','business','number','Diem tich luy / 100k VND','2026-08-03 07:51:21.525');
/*!40000 ALTER TABLE `setting` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `role` varchar(30) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `avatarUrl` varchar(500) DEFAULT NULL,
  `hourlyRate` decimal(8,2) DEFAULT NULL,
  `commissionRate` decimal(5,2) DEFAULT NULL,
  `joinDate` date DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staffschedule`
--

DROP TABLE IF EXISTS `staffschedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffschedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staffId` int(11) NOT NULL,
  `date` date NOT NULL,
  `startTime` varchar(5) NOT NULL,
  `endTime` varchar(5) NOT NULL,
  `breakStart` varchar(5) DEFAULT NULL,
  `breakEnd` varchar(5) DEFAULT NULL,
  `isDayOff` tinyint(1) NOT NULL DEFAULT 0,
  `note` varchar(500) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StaffSchedule_staffId_date_key` (`staffId`,`date`),
  KEY `StaffSchedule_date_idx` (`date`),
  CONSTRAINT `StaffSchedule_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffschedule`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staffschedule` WRITE;
/*!40000 ALTER TABLE `staffschedule` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffschedule` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staffspecialty`
--

DROP TABLE IF EXISTS `staffspecialty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffspecialty` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StaffSpecialty_name_key` (`name`),
  KEY `StaffSpecialty_name_idx` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffspecialty`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staffspecialty` WRITE;
/*!40000 ALTER TABLE `staffspecialty` DISABLE KEYS */;
INSERT INTO `staffspecialty` VALUES
(1,'Son Gel','Son gel cac loai',1,'2026-07-31 03:01:13.280','2026-08-03 07:51:21.434'),
(2,'Mong Acrylic','Lam mong acrylic',1,'2026-07-31 03:01:13.285','2026-08-03 07:51:21.439'),
(3,'Nail Art','Hoa tiet, ve tay, decal',1,'2026-07-31 03:01:13.289','2026-08-03 07:51:21.442'),
(4,'Manicure','Cham soc mong tay',1,'2026-07-31 03:01:13.291','2026-08-03 07:51:21.446'),
(5,'Pedicure','Cham soc mong chan',1,'2026-07-31 03:01:13.296','2026-08-03 07:51:21.451'),
(6,'Sua mong','Repair, bo gel',1,'2026-07-31 03:01:13.299','2026-08-03 07:51:21.454'),
(7,'Gel Extension','Dap gel dai',1,'2026-07-31 03:01:13.302','2026-08-03 07:51:21.458'),
(8,'Polygel','Polygel nails',1,'2026-07-31 03:01:13.305','2026-08-03 07:51:21.462');
/*!40000 ALTER TABLE `staffspecialty` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `staffspecialtymapping`
--

DROP TABLE IF EXISTS `staffspecialtymapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffspecialtymapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staffId` int(11) NOT NULL,
  `specialtyId` int(11) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `StaffSpecialtyMapping_staffId_specialtyId_key` (`staffId`,`specialtyId`),
  KEY `StaffSpecialtyMapping_staffId_idx` (`staffId`),
  KEY `StaffSpecialtyMapping_specialtyId_idx` (`specialtyId`),
  CONSTRAINT `StaffSpecialtyMapping_specialtyId_fkey` FOREIGN KEY (`specialtyId`) REFERENCES `staffspecialty` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `StaffSpecialtyMapping_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffspecialtymapping`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `staffspecialtymapping` WRITE;
/*!40000 ALTER TABLE `staffspecialtymapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffspecialtymapping` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `upsellcampaign`
--

DROP TABLE IF EXISTS `upsellcampaign`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `upsellcampaign` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(30) NOT NULL,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `targetTags` text DEFAULT NULL,
  `discountPct` decimal(5,2) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `UpsellCampaign_isActive_startDate_endDate_idx` (`isActive`,`startDate`,`endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `upsellcampaign`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `upsellcampaign` WRITE;
/*!40000 ALTER TABLE `upsellcampaign` DISABLE KEYS */;
/*!40000 ALTER TABLE `upsellcampaign` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(30) NOT NULL DEFAULT 'staff',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `phone` varchar(20) DEFAULT NULL,
  `avatarUrl` varchar(500) DEFAULT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `staffId` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_email_idx` (`email`),
  KEY `User_role_idx` (`role`),
  KEY `User_isActive_idx` (`isActive`),
  KEY `User_staffId_idx` (`staffId`),
  CONSTRAINT `User_staffId_fkey` FOREIGN KEY (`staffId`) REFERENCES `staff` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(1,'admin@maiai.com','$2b$12$mjVzrVWmqraJ4fVyeX0DJu9tj4SL5Pwjp9shN6BnIDXRnTHk1ujLu','Admin','owner',1,NULL,NULL,'2026-08-03 10:25:17.124',NULL,'2026-08-03 07:28:02.359','2026-08-03 08:57:48.003'),
(2,'manager@maiai.com','$2b$12$FaXwixEJ..Pby89xV1WFuuLFWe7BA2JWuy3Tg5IR7kjAuC3jJlPc2','Manager','manager',1,NULL,NULL,'2026-08-03 10:25:27.939',NULL,'2026-08-03 07:51:20.917','2026-08-03 07:54:19.238'),
(3,'staff@maiai.com','$2b$12$xFnAcyJoLgsrXMPapj0AKOkaWVyP.BHa9Jl0J29G/8h8w1T2jZvJe','Staff','staff',1,NULL,NULL,'2026-08-03 10:25:40.042',NULL,'2026-08-03 07:51:21.175','2026-08-03 07:54:32.422'),
(4,'reception@maiai.com','$2b$12$VtSHS.Ji.0b4mhgrdai8FeV6iFMIfU0PcWyNw6Auub/3SOjlnBftW','Reception','staff',1,NULL,NULL,'2026-08-03 07:54:42.492',NULL,'2026-08-03 07:51:21.429','2026-08-03 07:54:42.493');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping routines for database 'maiai_crm'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-08-03 17:51:14
