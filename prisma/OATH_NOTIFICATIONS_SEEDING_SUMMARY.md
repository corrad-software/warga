# Oath Schedule Notifications Seeding Summary

## Overview
Successfully populated sample notification data for the `notifications` table to notify applicants about their oath schedules through multiple channels (EMAIL, SMS, SYSTEM).

## Total Records Created
- **Total Notifications:** 30
- **Total Applicants Notified:** 10
- **Channels Used:** EMAIL, SMS, SYSTEM (3 notifications per applicant)

## Notification Distribution

### By Channel
| Channel | Count | Success Rate |
|---------|-------|--------------|
| 📧 EMAIL | 10 | 90.0% |
| 📱 SMS | 10 | 100.0% |
| 💻 SYSTEM | 10 | 60.0% |
| **Overall** | **30** | **83.3%** |

### By Status
| Status | Count | Description |
|--------|-------|-------------|
| ✅ BERJAYA (Success) | 25 | Successfully sent notifications |
| ❌ GAGAL (Failed) | 5 | Failed notification attempts |

### By Recipient Type
| Type | Count |
|------|-------|
| PEMOHON (Applicant) | 30 |

## Notification Types by Oath Status

### 1. DIJADUALKAN (Scheduled) - 4 Applicants
Notifications sent to applicants about upcoming oath ceremonies.

**Example Applicants:**
- TAN WEI MING - Scheduled for Feb 15, 2026
- NURUL HUDA BINTI ZAINAL - Scheduled for Mar 8, 2026
- NUR AISYAH BINTI IBRAHIM - Scheduled for Mar 9, 2026
- RAJESH A/L KUMAR - Scheduled for Mar 10, 2026

**Message Content:**
- Email: Full details with date, time, location, and instructions
- SMS: Brief reminder with key details
- System: Internal notification for tracking

### 2. SELESAI (Completed) - 3 Applicants
Congratulatory notifications sent after successful oath ceremony completion.

**Example Applicants:**
- AHMAD BIN ABDULLAH - Completed Nov 12, 2025
- SITI NURHALIZA BINTI MOHD RAZALI - Completed Nov 12, 2025
- MUHAMMAD HAFIZ BIN KAMAL - Completed Dec 24, 2025

**Message Content:**
- Email: Congratulations message with certificate collection timeline
- SMS: Brief congratulations and next steps
- System: Completion confirmation for records

### 3. DITANGGUH (Postponed) - 2 Applicants
Notifications informing applicants about postponed oath ceremonies.

**Example Applicants:**
- FATIMAH BINTI HASSAN - Originally scheduled Jan 27, 2026
- MOHD AZLAN BIN RAZAK - Originally scheduled Feb 1, 2026

**Message Content:**
- Email: Apology and information about rescheduling
- SMS: Brief postponement notice
- System: Postponement record for tracking

### 4. TIDAK_HADIR (Did Not Attend) - 1 Applicant
Notifications sent to applicant who missed their oath ceremony.

**Example Applicant:**
- WONG KAH YONG - Missed ceremony on Jan 22, 2026

**Message Content:**
- Email: Notice of absence with instructions to contact office
- SMS: Urgent reminder to reschedule
- System: Absence record for follow-up

## Sample Notification Messages

### EMAIL Notification (Scheduled - Bahasa Malaysia)
```
Kepada [Nama Pemohon],

Upacara mengangkat sumpah anda telah dijadualkan seperti berikut:

Tarikh: [Tarikh]
Masa: [Masa]
Lokasi: [Lokasi]

Sila hadir 15 minit lebih awal dan bawa:
- Dokumen pengenalan asal
- Surat rujukan permohonan
- Dokumen sokongan yang diperlukan

Jika anda perlu menjadual semula, sila hubungi kami sekurang-kurangnya 3 hari lebih awal.

Sekian, terima kasih.
Jabatan Pendaftaran Negara Malaysia
```

### SMS Notification (Scheduled - Bahasa Malaysia)
```
[Nama], upacara sumpah anda dijadualkan pada [Tarikh] jam [Masa]. Lokasi: [Lokasi]. Sila hadir 15 minit awal.
```

### SYSTEM Notification (Scheduled - Bahasa Malaysia)
```
Upacara sumpah dijadualkan pada [Tarikh] jam [Masa]
```

## Notification Timing Strategy

### For Scheduled Oaths (DIJADUALKAN)
- Sent **7-14 days before** the oath date
- Gives applicants adequate time to prepare

### For Completed Oaths (SELESAI)
- Sent **1-2 days after** oath completion
- Provides certificate collection information

### For Postponed Oaths (DITANGGUH)
- Sent **1 day after** the original date
- Informs about postponement immediately

### For Missed Oaths (TIDAK_HADIR)
- Sent **1 day after** the scheduled date
- Urgent notification to reschedule

## Multi-Language Support

All notifications are provided in **Bahasa Malaysia** (primary) with English versions available in the code. The notification messages include:

### Bahasa Malaysia Terms:
- **Kepada** - Dear/To
- **Tahniah** - Congratulations
- **Dijadualkan** - Scheduled
- **Ditangguhkan** - Postponed
- **Tidak hadir** - Did not attend
- **Sila** - Please
- **Sekian, terima kasih** - Thank you

## Database Schema Reference

```prisma
model Notification {
  id            Int          @id @default(autoincrement()) @map("notification_id")
  applicationId Int?         @map("application_id")
  application   Application? @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  
  recipientType String?   @map("recipient_type") // PEMOHON, PEGAWAI
  channel       String?   // EMAIL, SMS, SYSTEM
  message       String?
  status        String?   // BERJAYA, GAGAL
  sentAt        DateTime? @map("sent_at")
  
  createdDate   DateTime  @default(now()) @map("createddate")
  createdBy     String    @map("createdby")
  updatedDate   DateTime? @updatedAt @map("updateddate")
  updatedBy     String?   @map("updatedby")
  
  @@map("notifications")
}
```

## Files Created

1. **prisma/seed-oath-notifications.ts**
   - Main seed file for creating oath schedule notifications
   - Generates notifications for all oath statuses
   - Creates EMAIL, SMS, and SYSTEM notifications for each applicant
   - Includes comprehensive message templates in Bahasa Malaysia

2. **prisma/verify-oath-notifications.ts**
   - Verification script to display all notifications
   - Shows detailed breakdown by applicant
   - Provides summary statistics and success rates

## How to Run the Seeds

```bash
# Ensure oath schedules exist first
npx tsx prisma/seed-oath-schedules.ts

# Run the oath notifications seed
npx tsx prisma/seed-oath-notifications.ts

# Verify the notification data
npx tsx prisma/verify-oath-notifications.ts
```

## Features Implemented

✅ **Multi-Channel Notifications**
- EMAIL: Detailed formal messages
- SMS: Concise mobile-friendly messages
- SYSTEM: Internal tracking notifications

✅ **Realistic Delivery Status**
- ~83% overall success rate
- SMS: 100% success (most reliable)
- EMAIL: 90% success (very reliable)
- SYSTEM: 60% success (some system issues)

✅ **Status-Specific Messages**
- Scheduled: Includes date, time, location, preparation instructions
- Completed: Congratulations and certificate information
- Postponed: Apology and rescheduling information
- Missed: Urgent notice and contact instructions

✅ **Smart Timing**
- Scheduled notifications sent 7-14 days in advance
- Completion notifications sent 1-2 days after oath
- Postponement/absence notifications sent next day

✅ **Proper Audit Trail**
- All notifications include `sentAt` timestamp (for successful ones)
- Created by SYSTEM for automated notifications
- Linked to specific applications

## Sample Queries

### Get all notifications for a specific applicant
```sql
SELECT n.*, a.applicationRef, ap.fullName
FROM notifications n
JOIN applications a ON n.applicationId = a.application_id
JOIN pre_applications pa ON a.pre_app_id = pa.pre_app_id
JOIN applicant ap ON pa.applicant_id = ap.applicant_id
WHERE ap.fullName = 'AHMAD BIN ABDULLAH';
```

### Get success rate by channel
```sql
SELECT 
  channel,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'BERJAYA' THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN status = 'BERJAYA' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as success_rate
FROM notifications
GROUP BY channel;
```

### Get failed notifications for retry
```sql
SELECT n.*, ap.fullName, os.oathDate, os.oathTime
FROM notifications n
JOIN applications a ON n.applicationId = a.application_id
JOIN pre_applications pa ON a.pre_app_id = pa.pre_app_id
JOIN applicant ap ON pa.applicant_id = ap.applicant_id
JOIN oath_schedules os ON a.application_id = os.application_id
WHERE n.status = 'GAGAL';
```

## Testing Scenarios

The seeded data supports testing various scenarios:

1. **Scheduled Oath Notifications** (4 applicants)
   - Test reminder notifications before oath
   - Test notification delivery tracking
   - Test multi-channel notification display

2. **Completed Oath Notifications** (3 applicants)
   - Test congratulatory messages
   - Test post-oath workflow
   - Test certificate status updates

3. **Postponed Oath Notifications** (2 applicants)
   - Test postponement handling
   - Test rescheduling workflow
   - Test communication with affected applicants

4. **Missed Oath Notifications** (1 applicant)
   - Test absence tracking
   - Test follow-up procedures
   - Test urgent notification handling

5. **Failed Notification Handling** (5 failures)
   - Test notification retry logic
   - Test error handling
   - Test alternate channel fallback

## Next Steps

You can now:
1. ✅ View notifications in Prisma Studio
2. ✅ Test notification display in your application
3. ✅ Build notification management features
4. ✅ Create notification resend functionality
5. ✅ Test email/SMS integration with real services
6. ✅ Build notification history dashboards
7. ✅ Implement notification preferences per applicant
8. ✅ Add notification templates management

## Notes

- All notifications are created with `recipientType: 'PEMOHON'` (Applicant)
- Messages are in Bahasa Malaysia for Malaysian government context
- Notification timing is realistic based on oath schedule dates
- Success/failure distribution reflects typical system behavior
- All records include proper audit fields (`createdBy: 'SYSTEM'`)
