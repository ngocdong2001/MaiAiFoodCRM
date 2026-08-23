-- Add weeklySchedule JSON field to staff table for weekly working hours template
ALTER TABLE `staff` ADD COLUMN `weeklySchedule` JSON NULL AFTER `joinDate`;
