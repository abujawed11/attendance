-- CreateTable
CREATE TABLE `Section` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(16) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `institutionId` INTEGER NOT NULL,
    `schoolClass` VARCHAR(191) NULL,
    `schoolSection` VARCHAR(191) NULL,
    `board` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `yearOfStudy` INTEGER NULL,
    `semester` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Section_publicId_key`(`publicId`),
    INDEX `Section_institutionId_idx`(`institutionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Enrollment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentUserId` INTEGER NOT NULL,
    `sectionId` INTEGER NOT NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Enrollment_studentUserId_idx`(`studentUserId`),
    INDEX `Enrollment_sectionId_idx`(`sectionId`),
    UNIQUE INDEX `Enrollment_studentUserId_sectionId_key`(`studentUserId`, `sectionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FacultySection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facultyUserId` INTEGER NOT NULL,
    `sectionId` INTEGER NOT NULL,
    `subject` VARCHAR(191) NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `FacultySection_facultyUserId_idx`(`facultyUserId`),
    INDEX `FacultySection_sectionId_idx`(`sectionId`),
    UNIQUE INDEX `FacultySection_facultyUserId_sectionId_subject_key`(`facultyUserId`, `sectionId`, `subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicId` VARCHAR(16) NOT NULL,
    `sectionId` INTEGER NOT NULL,
    `facultyUserId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `subject` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AttendanceSession_publicId_key`(`publicId`),
    INDEX `AttendanceSession_sectionId_date_idx`(`sectionId`, `date`),
    INDEX `AttendanceSession_facultyUserId_idx`(`facultyUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendancePunch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` INTEGER NOT NULL,
    `enrollmentId` INTEGER NOT NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LATE') NOT NULL,
    `remarks` TEXT NULL,
    `markedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AttendancePunch_sessionId_idx`(`sessionId`),
    INDEX `AttendancePunch_enrollmentId_idx`(`enrollmentId`),
    UNIQUE INDEX `AttendancePunch_sessionId_enrollmentId_key`(`sessionId`, `enrollmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Section` ADD CONSTRAINT `Section_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `Institution`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_studentUserId_fkey` FOREIGN KEY (`studentUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Enrollment` ADD CONSTRAINT `Enrollment_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacultySection` ADD CONSTRAINT `FacultySection_facultyUserId_fkey` FOREIGN KEY (`facultyUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FacultySection` ADD CONSTRAINT `FacultySection_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceSession` ADD CONSTRAINT `AttendanceSession_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `Section`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendanceSession` ADD CONSTRAINT `AttendanceSession_facultyUserId_fkey` FOREIGN KEY (`facultyUserId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendancePunch` ADD CONSTRAINT `AttendancePunch_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `AttendanceSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AttendancePunch` ADD CONSTRAINT `AttendancePunch_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `Enrollment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
