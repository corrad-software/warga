import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
})

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log('========================================')
  console.log('OATH SCHEDULES VERIFICATION')
  console.log('========================================\n')

  // Get all oath schedules with related application and applicant info
  const oathSchedules = await prisma.oathSchedule.findMany({
    include: {
      application: {
        include: {
          preApplication: {
            include: {
              applicant: {
                select: {
                  id: true,
                  fullName: true,
                  applicationType: true,
                }
              }
            }
          }
        }
      },
      oathRecords: true,
    },
    orderBy: {
      oathDate: 'asc'
    }
  })

  console.log(`Total Oath Schedules: ${oathSchedules.length}\n`)

  oathSchedules.forEach((schedule, index) => {
    console.log(`${index + 1}. Oath Schedule ID: ${schedule.id}`)
    console.log(`   Application Ref: ${schedule.application?.applicationRef || 'N/A'}`)
    console.log(`   Applicant: ${schedule.application?.preApplication?.applicant?.fullName || 'N/A'}`)
    console.log(`   Date: ${schedule.oathDate?.toISOString().split('T')[0] || 'N/A'}`)
    console.log(`   Time: ${schedule.oathTime || 'N/A'}`)
    console.log(`   Location: ${schedule.location || 'N/A'}`)
    console.log(`   Status: ${schedule.status || 'N/A'}`)
    console.log(`   Oath Records: ${schedule.oathRecords.length}`)
    console.log()
  })

  // Status breakdown
  const statusCounts = await prisma.oathSchedule.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('========================================')
  console.log('STATUS BREAKDOWN')
  console.log('========================================')
  statusCounts.forEach(item => {
    console.log(`${item.status}: ${item._count}`)
  })

  // Upcoming schedules
  const today = new Date()
  const upcomingSchedules = await prisma.oathSchedule.count({
    where: {
      oathDate: {
        gte: today
      },
      status: 'DIJADUALKAN'
    }
  })

  console.log('\n========================================')
  console.log('QUICK STATS')
  console.log('========================================')
  console.log(`Upcoming Scheduled Oaths: ${upcomingSchedules}`)
  console.log(`Total Oath Records: ${await prisma.oathRecord.count()}`)
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
