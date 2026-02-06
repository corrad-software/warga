import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({
  adapter,
})

// Helper function to generate random dates in the past
function pastDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

// Helper function to generate random dates in the future
function futureDate(daysFromNow: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

// Sample locations for oath ceremonies
const locations = [
  'JABATAN PENDAFTARAN NEGARA, PUTRAJAYA',
  'JABATAN IMIGRESEN MALAYSIA, KUALA LUMPUR',
  'PEJABAT KEDUTAAN MALAYSIA, LONDON',
  'PEJABAT KEDUTAAN MALAYSIA, PARIS',
  'PEJABAT KEDUTAAN MALAYSIA, WASHINGTON D.C.',
  'PEJABAT KEDUTAAN MALAYSIA, BEIJING',
  'JABATAN PENDAFTARAN NEGARA, KOTA KINABALU',
  'JABATAN PENDAFTARAN NEGARA, KUCHING',
]

async function main() {
  console.log('Seeding additional oath schedules with diverse statuses...')

  // Get applications that don't have oath schedules yet
  const applicationsWithoutSchedule = await prisma.application.findMany({
    where: {
      status: {
        in: ['DILULUSKAN', 'SELESAI', 'MENUNGGU_SUMPAH']
      },
      oathSchedules: {
        none: {}
      }
    },
    take: 10,
  })

  if (applicationsWithoutSchedule.length === 0) {
    console.log('All approved applications already have oath schedules.')
    console.log('Creating additional schedules for demonstration purposes...')
    
    // Get some applications that already have schedules to create new schedules
    // (Note: in real scenario, you wouldn't do this, but for demo purposes it's fine)
    const existingApps = await prisma.application.findMany({
      where: {
        status: {
          in: ['DILULUSKAN', 'SELESAI']
        }
      },
      take: 4,
      skip: 6, // Skip the first 6 that already have schedules
    })

    if (existingApps.length > 0) {
      // Add additional oath schedules for demo
      const additionalSchedules = [
        {
          applicationId: existingApps[0]?.id,
          oathDate: pastDate(10),
          oathTime: '10:00',
          location: 'JABATAN PENDAFTARAN NEGARA, PUTRAJAYA',
          status: 'DITANGGUH',
        },
        {
          applicationId: existingApps[1]?.id,
          oathDate: pastDate(15),
          oathTime: '14:00',
          location: 'PEJABAT KEDUTAAN MALAYSIA, LONDON',
          status: 'TIDAK_HADIR',
        },
        {
          applicationId: existingApps[2]?.id,
          oathDate: futureDate(45),
          oathTime: '09:00',
          location: 'JABATAN PENDAFTARAN NEGARA, KOTA KINABALU',
          status: 'DIJADUALKAN',
        },
        {
          applicationId: existingApps[3]?.id,
          oathDate: pastDate(5),
          oathTime: '15:00',
          location: 'JABATAN IMIGRESEN MALAYSIA, KUALA LUMPUR',
          status: 'DITANGGUH',
        },
      ]

      for (const scheduleData of additionalSchedules) {
        if (!scheduleData.applicationId) continue

        try {
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

          console.log(`✓ Created ${scheduleData.status} oath schedule for application ID ${scheduleData.applicationId}`)
        } catch (error: any) {
          console.error(`✗ Failed to create oath schedule:`, error.message)
        }
      }
    }
  } else {
    console.log(`Found ${applicationsWithoutSchedule.length} applications without oath schedules.`)

    // Create diverse oath schedules
    const schedules = []

    for (let i = 0; i < applicationsWithoutSchedule.length; i++) {
      const app = applicationsWithoutSchedule[i]
      let status: string
      let oathDate: Date
      let oathTime: string

      if (i === 0) {
        // Postponed
        status = 'DITANGGUH'
        oathDate = pastDate(10)
        oathTime = '10:00'
      } else if (i === 1) {
        // Did not attend
        status = 'TIDAK_HADIR'
        oathDate = pastDate(15)
        oathTime = '14:00'
      } else if (i === 2) {
        // Another postponed
        status = 'DITANGGUH'
        oathDate = pastDate(5)
        oathTime = '15:00'
      } else {
        // Scheduled
        status = 'DIJADUALKAN'
        oathDate = futureDate(20 + i * 7)
        oathTime = i % 2 === 0 ? '09:00' : '14:00'
      }

      schedules.push({
        applicationId: app.id,
        oathDate,
        oathTime,
        location: locations[i % locations.length],
        status,
      })
    }

    // Insert oath schedules
    for (const scheduleData of schedules) {
      try {
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

        console.log(`✓ Created ${scheduleData.status} oath schedule for application ID ${scheduleData.applicationId} on ${scheduleData.oathDate.toISOString().split('T')[0]}`)
      } catch (error: any) {
        console.error(`✗ Failed to create oath schedule:`, error.message)
      }
    }
  }

  // Summary
  const totalSchedules = await prisma.oathSchedule.count()
  const statusBreakdown = await prisma.oathSchedule.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('\n========================================')
  console.log('Additional Oath Schedules Seeding Completed!')
  console.log('========================================')
  console.log(`Total Oath Schedules in Database: ${totalSchedules}`)
  console.log('\nStatus Breakdown:')
  statusBreakdown.forEach(item => {
    const statusLabel = {
      'DIJADUALKAN': 'Scheduled',
      'SELESAI': 'Completed',
      'TIDAK_HADIR': 'Did Not Attend',
      'DITANGGUH': 'Postponed'
    }[item.status || ''] || item.status
    console.log(`  ${item.status} (${statusLabel}): ${item._count}`)
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
