import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
})

const prisma = new PrismaClient({
  adapter,
})

// Helper function to generate dates
function daysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function main() {
  console.log('Creating complete set of oath schedule examples...\n')

  // Get all applications
  const allApplications = await prisma.application.findMany()
  
  if (allApplications.length < 10) {
    console.log('Not enough applications. Please run seed-related-tables.ts first.')
    return
  }

  // Get applications that don't have oath schedules
  const appsWithoutSchedules = []
  for (const app of allApplications) {
    const existingSchedule = await prisma.oathSchedule.findFirst({
      where: { applicationId: app.id }
    })
    if (!existingSchedule) {
      appsWithoutSchedules.push(app)
    }
  }

  console.log(`Found ${appsWithoutSchedules.length} applications without oath schedules.`)

  if (appsWithoutSchedules.length === 0) {
    console.log('All applications already have oath schedules.')
    return
  }

  // Create diverse examples
  const exampleSchedules = [
    {
      index: 0,
      oathDate: daysFromNow(-10),
      oathTime: '10:00',
      location: 'JABATAN PENDAFTARAN NEGARA, PUTRAJAYA',
      status: 'DITANGGUH',
      description: 'Postponed - Applicant requested reschedule'
    },
    {
      index: 1,
      oathDate: daysFromNow(-15),
      oathTime: '14:00',
      location: 'PEJABAT KEDUTAAN MALAYSIA, LONDON',
      status: 'TIDAK_HADIR',
      description: 'Did not attend - No show without notice'
    },
    {
      index: 2,
      oathDate: daysFromNow(30),
      oathTime: '09:00',
      location: 'JABATAN PENDAFTARAN NEGARA, KOTA KINABALU',
      status: 'DIJADUALKAN',
      description: 'Scheduled - Upcoming ceremony'
    },
    {
      index: 3,
      oathDate: daysFromNow(-5),
      oathTime: '15:00',
      location: 'JABATAN IMIGRESEN MALAYSIA, KUALA LUMPUR',
      status: 'DITANGGUH',
      description: 'Postponed - Due to official\'s unavailability'
    },
  ]

  let created = 0
  for (const example of exampleSchedules) {
    if (example.index >= appsWithoutSchedules.length) continue

    const app = appsWithoutSchedules[example.index]
    
    try {
      await prisma.oathSchedule.create({
        data: {
          applicationId: app.id,
          oathDate: example.oathDate,
          oathTime: example.oathTime,
          location: example.location,
          status: example.status,
          createdBy: 'SYSTEM',
        }
      })

      console.log(`✓ Created: ${example.status} - ${example.description}`)
      console.log(`  Application: ${app.applicationRef || app.id}`)
      console.log(`  Date: ${example.oathDate.toISOString().split('T')[0]} at ${example.oathTime}`)
      console.log(`  Location: ${example.location}\n`)
      created++
    } catch (error: any) {
      console.error(`✗ Failed to create oath schedule:`, error.message)
    }
  }

  // Final summary
  const totalSchedules = await prisma.oathSchedule.count()
  const statusBreakdown = await prisma.oathSchedule.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('========================================')
  console.log('COMPLETE OATH SCHEDULES SUMMARY')
  console.log('========================================')
  console.log(`Total Oath Schedules: ${totalSchedules}`)
  console.log(`Newly Created: ${created}\n`)
  console.log('Status Breakdown:')
  statusBreakdown.forEach(item => {
    const statusInfo = {
      'DIJADUALKAN': { label: 'Scheduled', desc: 'Upcoming oath ceremonies' },
      'SELESAI': { label: 'Completed', desc: 'Successfully completed ceremonies' },
      'TIDAK_HADIR': { label: 'Did Not Attend', desc: 'Applicant failed to attend' },
      'DITANGGUH': { label: 'Postponed', desc: 'Rescheduled ceremonies' }
    }[item.status || '']
    
    if (statusInfo) {
      console.log(`  ${item.status} (${statusInfo.label}): ${item._count}`)
      console.log(`    - ${statusInfo.desc}`)
    }
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
