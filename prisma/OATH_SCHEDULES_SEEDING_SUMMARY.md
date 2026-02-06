# Oath Schedules Seeding Summary

## Overview
Successfully populated sample data for the `oath_schedules` table with comprehensive examples covering all oath ceremony statuses.

## Total Records Created
- **Total Oath Schedules:** 10
- **Total Oath Records:** 3 (for completed ceremonies)

## Status Distribution

### 1. SELESAI (Completed) - 3 records
Successfully completed oath ceremonies with associated oath records.

**Examples:**
- **AHMAD BIN ABDULLAH** (APP-2025-00001)
  - Date: 2025-11-12 at 09:00
  - Location: PEJABAT KEDUTAAN MALAYSIA, PARIS
  - Has oath record ✓

- **SITI NURHALIZA BINTI MOHD RAZALI** (APP-2025-00002)
  - Date: 2025-11-12 at 10:00
  - Location: PEJABAT KEDUTAAN MALAYSIA, SINGAPORE
  - Has oath record ✓

- **MUHAMMAD HAFIZ BIN KAMAL** (APP-2025-00003)
  - Date: 2025-12-24 at 14:00
  - Location: JABATAN PENDAFTARAN NEGARA, JOHOR BAHRU
  - Has oath record ✓

### 2. DIJADUALKAN (Scheduled) - 4 records
Upcoming oath ceremonies scheduled for future dates.

**Examples:**
- **TAN WEI MING** (APP-2025-00005)
  - Date: 2026-02-15 at 10:00
  - Location: JABATAN PENDAFTARAN NEGARA, PENANG

- **NURUL HUDA BINTI ZAINAL** (APP-2025-00009)
  - Date: 2026-03-08 at 09:00
  - Location: JABATAN PENDAFTARAN NEGARA, KOTA KINABALU

- **NUR AISYAH BINTI IBRAHIM** (APP-2025-00004)
  - Date: 2026-03-09 at 14:00
  - Location: JABATAN PENDAFTARAN NEGARA, PENANG

- **RAJESH A/L KUMAR** (APP-2025-00006)
  - Date: 2026-03-10 at 16:00
  - Location: PEJABAT KEDUTAAN MALAYSIA, PARIS

### 3. DITANGGUH (Postponed) - 2 records
Oath ceremonies that were scheduled but postponed for various reasons.

**Examples:**
- **FATIMAH BINTI HASSAN** (APP-2025-00007)
  - Date: 2026-01-27 at 10:00
  - Location: JABATAN PENDAFTARAN NEGARA, PUTRAJAYA
  - Reason: Applicant requested reschedule

- **MOHD AZLAN BIN RAZAK** (APP-2025-00010)
  - Date: 2026-02-01 at 15:00
  - Location: JABATAN IMIGRESEN MALAYSIA, KUALA LUMPUR
  - Reason: Official's unavailability

### 4. TIDAK_HADIR (Did Not Attend) - 1 record
Applicant failed to attend the scheduled oath ceremony.

**Example:**
- **WONG KAH YONG** (APP-2025-00008)
  - Date: 2026-01-22 at 14:00
  - Location: PEJABAT KEDUTAAN MALAYSIA, LONDON
  - Reason: No show without notice

## Oath Ceremony Locations
The sample data includes various locations across Malaysia and international embassies:

### Domestic Locations:
1. JABATAN PENDAFTARAN NEGARA, PUTRAJAYA
2. JABATAN IMIGRESEN MALAYSIA, KUALA LUMPUR
3. JABATAN PENDAFTARAN NEGARA, JOHOR BAHRU
4. JABATAN PENDAFTARAN NEGARA, PENANG
5. JABATAN PENDAFTARAN NEGARA, KOTA KINABALU

### International Embassies:
1. PEJABAT KEDUTAAN MALAYSIA, PARIS
2. PEJABAT KEDUTAAN MALAYSIA, SINGAPORE
3. PEJABAT KEDUTAAN MALAYSIA, LONDON

## Time Slots
Oath ceremonies are scheduled during typical working hours:
- Morning slots: 09:00, 10:00
- Afternoon slots: 14:00, 15:00, 16:00

## Database Schema Reference

```prisma
model OathSchedule {
  id            Int          @id @default(autoincrement()) @map("schedule_id")
  applicationId Int?         @map("application_id")
  application   Application? @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  
  oathDate      DateTime?    @map("oath_date")
  oathTime      String?      @map("oath_time")
  location      String?
  status        String?      // DIJADUALKAN, SELESAI, TIDAK_HADIR, DITANGGUH
  
  createdDate   DateTime     @default(now()) @map("createddate")
  createdBy     String       @map("createdby")
  updatedDate   DateTime?    @updatedAt @map("updateddate")
  updatedBy     String?      @map("updatedby")
  
  oathRecords   OathRecord[]
  
  @@map("oath_schedules")
}
```

## Files Created

1. **prisma/seed-oath-schedules.ts**
   - Main seed file for creating initial oath schedules
   - Creates diverse examples with different statuses

2. **prisma/seed-complete-oath-examples.ts**
   - Additional seed file to ensure all status types are represented
   - Creates DITANGGUH and TIDAK_HADIR examples

3. **prisma/verify-oath-schedules.ts**
   - Verification script to display all oath schedules
   - Shows detailed information including applicant names and status breakdown

## How to Run the Seeds

```bash
# Run the main oath schedules seed
npx tsx prisma/seed-oath-schedules.ts

# Add complete examples with all statuses
npx tsx prisma/seed-complete-oath-examples.ts

# Verify the data
npx tsx prisma/verify-oath-schedules.ts
```

## Notes

- All oath schedules are properly linked to approved applications
- Completed ceremonies (SELESAI status) have associated `OathRecord` entries
- The sample data includes realistic dates (past dates for completed/missed ceremonies, future dates for scheduled ones)
- Locations represent actual government offices and Malaysian embassies
- All records are created with `createdBy: 'SYSTEM'` for audit purposes

## Next Steps

You can now:
1. Query oath schedules in your application
2. Test oath ceremony management features
3. Build reports and dashboards using this sample data
4. Test workflow transitions between different oath statuses
