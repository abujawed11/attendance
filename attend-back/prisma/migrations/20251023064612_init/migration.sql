/*
  Warnings:

  - A unique constraint covering the columns `[employeeId]` on the table `FacultyCollegeProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[employeeId]` on the table `FacultySchoolProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `FacultyCollegeProfile_employeeId_key` ON `FacultyCollegeProfile`(`employeeId`);

-- CreateIndex
CREATE INDEX `FacultyCollegeProfile_employeeId_idx` ON `FacultyCollegeProfile`(`employeeId`);

-- CreateIndex
CREATE UNIQUE INDEX `FacultySchoolProfile_employeeId_key` ON `FacultySchoolProfile`(`employeeId`);

-- CreateIndex
CREATE INDEX `FacultySchoolProfile_employeeId_idx` ON `FacultySchoolProfile`(`employeeId`);
