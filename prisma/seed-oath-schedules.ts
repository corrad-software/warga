import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
})

const prisma = new PrismaClient({
  adapter,
})

// Helper function to generate random dates in the future
function futureDate(daysFromNow: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

// Helper function to generate random dates in the past
function pastDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

// Helper function to pick random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Sample locations for oath ceremonies
const locations = [
  'JABATAN PENDAFTARAN NEGARA, PUTRAJAYA',
  'JABATAN IMIGRESEN MALAYSIA, KUALA LUMPUR',
  'PEJABAT KEDUTAAN MALAYSIA, LONDON',
  'PEJABAT KEDUTAAN MALAYSIA, PARIS',
  'PEJABAT KEDUTAAN MALAYSIA, WASHINGTON D.C.',
  'PEJABAT KEDUTAAN MALAYSIA, BEIJING',
  'PEJABAT KEDUTAAN MALAYSIA, TOKYO',
  'PEJABAT KEDUTAAN MALAYSIA, SINGAPORE',
  'JABATAN PENDAFTARAN NEGARA, JOHOR BAHRU',
  'JABATAN PENDAFTARAN NEGARA, PENANG',
  'JABATAN PENDAFTARAN NEGARA, KOTA KINABALU',
  'JABATAN PENDAFTARAN NEGARA, KUCHING',
]

// Sample time slots for oath ceremonies
const timeSlots = [
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
]

async function main() {
  console.log('Seeding oath schedules...')

  // Get approved applications that need oath scheduling
  const applications = await prisma.application.findMany({
    where: {
      status: {
        in: ['DILULUSKAN', 'SELESAI', 'MENUNGGU_SUMPAH']
      }
    },
    take: 15, // Seed for first 15 approved applications
  })

  if (applications.length === 0) {
    console.log('No approved applications found. Please run seed-related-tables.ts first.')
    return
  }

  console.log(`Found ${applications.length} approved applications to schedule oaths.`)

  // Create oath schedules with different statuses
  const oathSchedulesData = []

  for (let i = 0; i < applications.length; i++) {
    const app = applications[i]
    let status: string
    let oathDate: Date
    let remarks: string | null = null

    // Distribute statuses across applications
    if (i < 3) {
      // First 3: Completed oath ceremonies (past)
      status = 'SELESAI'
      oathDate = pastDate(Math.floor(Math.random() * 60) + 30) // 30-90 days ago
    } else if (i < 6) {
      // Next 3: Scheduled for upcoming dates
      status = 'DIJADUALKAN'
      oathDate = futureDate(Math.floor(Math.random() * 30) + 7) // 7-37 days from now
    } else if (i < 8) {
      // Next 2: Postponed (originally scheduled but postponed)
      status = 'DITANGGUH'
      oathDate = pastDate(Math.floor(Math.random() * 14) + 1) // Was 1-14 days ago
      remarks = 'Ditangguh atas permintaan pemohon / Postponed at applicant\'s request'
    } else if (i < 10) {
      // Next 2: Did not attend
      status = 'TIDAK_HADIR'
      oathDate = pastDate(Math.floor(Math.random() * 21) + 7) // Was 7-28 days ago
      remarks = 'Pemohon tidak hadir tanpa notis / Applicant did not attend without notice'
    } else {
      // Remaining: Scheduled for near future
      status = 'DIJADUALKAN'
      oathDate = futureDate(Math.floor(Math.random() * 60) + 14) // 14-74 days from now
    }

    oathSchedulesData.push({
      applicationId: app.id,
      oathDate,
      oathTime: randomItem(timeSlots),
      location: randomItem(locations),
      status,
      remarks,
    })
  }

  // Insert oath schedules
  let createdCount = 0
  let skippedCount = 0

  for (const scheduleData of oathSchedulesData) {
    try {
      // Check if oath schedule already exists for this application
      const existing = await prisma.oathSchedule.findFirst({
        where: { applicationId: scheduleData.applicationId }
      })

      if (existing) {
        console.log(`Oath schedule for application ID ${scheduleData.applicationId} already exists, skipping...`)
        skippedCount++
        continue
      }

      await prisma.oathSchedule.create({
        data: {
          applicationId: scheduleData.applicationId,
          oathDate: scheduleData.oathDate,
          oathTime: scheduleData.oathTime,
          location: scheduleData.location,
          status: scheduleData.status,
          createdBy: 'SYSTEM',
        }
      })

      createdCount++
      console.log(`✓ Created oath schedule for application ID ${scheduleData.applicationId} - ${scheduleData.status} on ${scheduleData.oathDate.toISOString().split('T')[0]} at ${scheduleData.oathTime} (${scheduleData.location})`)

      // If status is SELESAI, create an oath record
      if (scheduleData.status === 'SELESAI') {
        const oathSchedule = await prisma.oathSchedule.findFirst({
          where: { applicationId: scheduleData.applicationId }
        })

        if (oathSchedule) {
          await prisma.oathRecord.create({
            data: {
              scheduleId: oathSchedule.id,
              applicationId: scheduleData.applicationId,
              officerId: 1, // Assuming officer ID 1
              executedAt: scheduleData.oathDate,
              remarks: 'Sumpah tadbir selesai dengan jayanya / Oath ceremony completed successfully',
              createdBy: 'SYSTEM',
            }
          })
          console.log(`  ✓ Created oath record for completed ceremony`)
        }
      }
    } catch (error: any) {
      console.error(`✗ Failed to create oath schedule for application ID ${scheduleData.applicationId}:`, error.message)
    }
  }

  // Summary
  const totalSchedules = await prisma.oathSchedule.count()
  const totalRecords = await prisma.oathRecord.count()
  const statusBreakdown = await prisma.oathSchedule.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('\n========================================')
  console.log('Oath Schedules Seeding Completed!')
  console.log('========================================')
  console.log(`Total Oath Schedules: ${totalSchedules}`)
  console.log(`Total Oath Records:   ${totalRecords}`)
  console.log(`Created:              ${createdCount}`)
  console.log(`Skipped:              ${skippedCount}`)
  console.log('\nStatus Breakdown:')
  statusBreakdown.forEach(item => {
    console.log(`  ${item.status}: ${item._count}`)
  })
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
