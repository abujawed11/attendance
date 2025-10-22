/*
  Warnings:

  - You are about to drop the column `subject` on the `facultyschoolprofile` table. All the data in the column will be lost.
  - Added the required column `designation` to the `FacultyCollegeProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `FacultyCollegeProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `FacultySchoolProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `FacultySchoolProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `semester` on table `studentcollegeprofile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `board` on table `studentschoolprofile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `section` on table `studentschoolprofile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `facultycollegeprofile` ADD COLUMN `designation` VARCHAR(191) NOT NULL,
    ADD COLUMN `employeeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `facultyschoolprofile` DROP COLUMN `subject`,
    ADD COLUMN `department` VARCHAR(191) NOT NULL,
    ADD COLUMN `employeeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `studentcollegeprofile` MODIFY `semester` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `studentschoolprofile` MODIFY `board` VARCHAR(191) NOT NULL,
    MODIFY `section` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `OTP` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(6) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL DEFAULT 'signup',
    `expiresAt` DATETIME(3) NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OTP_email_purpose_idx`(`email`, `purpose`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
