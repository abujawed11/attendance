/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `studentschoolprofile` ADD COLUMN `parentEmail` VARCHAR(191) NULL,
    ADD COLUMN `parentName` VARCHAR(191) NULL,
    ADD COLUMN `parentPhone` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_phone_key` ON `User`(`phone`);
