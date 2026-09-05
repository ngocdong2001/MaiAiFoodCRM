-- Action keys (e.g. "calendar.updateAppointmentStatus") exceed the original
-- VARCHAR(20), causing every audit log insert to fail silently.
ALTER TABLE `auditlog` MODIFY `action` VARCHAR(64) NOT NULL;
