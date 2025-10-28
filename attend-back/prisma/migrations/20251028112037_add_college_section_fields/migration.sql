-- AlterTable
ALTER TABLE `section` ADD COLUMN `batch` VARCHAR(191) NULL,
    ADD COLUMN `collegeSection` VARCHAR(191) NULL,
    ADD COLUMN `maxCapacity` INTEGER NULL,
    ADD COLUMN `roomNumber` VARCHAR(191) NULL,
    ADD COLUMN `sectionType` VARCHAR(191) NULL;
