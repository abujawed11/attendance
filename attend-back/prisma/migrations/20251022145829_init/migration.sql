-- CreateTable
CREATE TABLE `Sequence` (
    `model` VARCHAR(191) NOT NULL,
    `next` INTEGER NOT NULL,

    PRIMARY KEY (`model`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Institution` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(16) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SCHOOL', 'COLLEGE') NOT NULL,
    `board` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Institution_publicId_key`(`publicId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(16) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `roleType` ENUM('STUDENT', 'FACULTY', 'PARENT', 'ADMIN') NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `institutionId` INTEGER NULL,

    UNIQUE INDEX `User_publicId_key`(`publicId`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invite` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(16) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `institutionId` INTEGER NULL,
    `allowedRoles` VARCHAR(191) NOT NULL,
    `allowedDomains` VARCHAR(191) NULL,
    `maxUses` INTEGER NOT NULL DEFAULT 1,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invite_publicId_key`(`publicId`),
    UNIQUE INDEX `Invite_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentSchoolProfile` (
    `userId` INTEGER NOT NULL,
    `institutionType` ENUM('SCHOOL', 'COLLEGE') NOT NULL DEFAULT 'SCHOOL',
    `schoolName` VARCHAR(191) NOT NULL,
    `board` VARCHAR(191) NULL,
    `class` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NULL,
    `rollNo` VARCHAR(191) NOT NULL,
    `dob` DATETIME(3) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentCollegeProfile` (
    `userId` INTEGER NOT NULL,
    `institutionType` ENUM('SCHOOL', 'COLLEGE') NOT NULL DEFAULT 'COLLEGE',
    `collegeName` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `yearOfStudy` INTEGER NOT NULL,
    `semester` INTEGER NULL,
    `regNo` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacultySchoolProfile` (
    `userId` INTEGER NOT NULL,
    `institutionType` ENUM('SCHOOL', 'COLLEGE') NOT NULL DEFAULT 'SCHOOL',
    `schoolName` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacultyCollegeProfile` (
    `userId` INTEGER NOT NULL,
    `institutionType` ENUM('SCHOOL', 'COLLEGE') NOT NULL DEFAULT 'COLLEGE',
    `collegeName` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParentProfile` (
    `userId` INTEGER NOT NULL,
    `provisionalStudentName` VARCHAR(191) NULL,
    `provisionalStudentClass` VARCHAR(191) NULL,
    `provisionalStudentRollNo` VARCHAR(191) NULL,
    `provisionalStudentDob` DATETIME(3) NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentGuardian` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parentUserId` INTEGER NOT NULL,
    `studentUserId` INTEGER NOT NULL,
    `relation` VARCHAR(191) NULL,

    UNIQUE INDEX `StudentGuardian_parentUserId_studentUserId_key`(`parentUserId`, `studentUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminProfile` (
    `userId` INTEGER NOT NULL,
    `institutionType` ENUM('SCHOOL', 'COLLEGE') NULL,
    `institutionName` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentSchoolProfile` ADD CONSTRAINT `StudentSchoolProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentCollegeProfile` ADD CONSTRAINT `StudentCollegeProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacultySchoolProfile` ADD CONSTRAINT `FacultySchoolProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacultyCollegeProfile` ADD CONSTRAINT `FacultyCollegeProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentProfile` ADD CONSTRAINT `ParentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentGuardian` ADD CONSTRAINT `StudentGuardian_parentUserId_fkey` FOREIGN KEY (`parentUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentGuardian` ADD CONSTRAINT `StudentGuardian_studentUserId_fkey` FOREIGN KEY (`studentUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminProfile` ADD CONSTRAINT `AdminProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
