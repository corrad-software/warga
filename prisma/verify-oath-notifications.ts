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
  console.log('OATH SCHEDULE NOTIFICATIONS VERIFICATION')
  console.log('========================================\n')

  // Get all notifications related to oath schedules
  const notifications = await prisma.notification.findMany({
    include: {
      application: {
        include: {
          preApplication: {
            include: {
              applicant: {
                select: {
                  fullName: true,
                }
              }
            }
          },
          oathSchedules: {
            select: {
              oathDate: true,
              oathTime: true,
              location: true,
              status: true,
            }
          }
        }
      }
    },
    orderBy: [
      { applicationId: 'asc' },
      { channel: 'asc' }
    ]
  })

  console.log(`Total Notifications: ${notifications.length}\n`)

  // Group by applicant
  const notificationsByApplicant = new Map<number, typeof notifications>()
  
  for (const notification of notifications) {
    const appId = notification.applicationId || 0
    if (!notificationsByApplicant.has(appId)) {
      notificationsByApplicant.set(appId, [])
    }
    notificationsByApplicant.get(appId)?.push(notification)
  }

  // Display by applicant
  let applicantIndex = 1
  for (const [appId, applicantNotifications] of notificationsByApplicant) {
    const firstNotif = applicantNotifications[0]
    const applicantName = firstNotif.application?.preApplication?.applicant?.fullName || 'Unknown'
    const oathSchedule = firstNotif.application?.oathSchedules?.[0]
    
    console.log(`${applicantIndex}. ${applicantName}`)
    console.log(`   Application ID: ${appId}`)
    
    if (oathSchedule) {
      console.log(`   Oath Status: ${oathSchedule.status}`)
      console.log(`   Oath Date: ${oathSchedule.oathDate?.toISOString().split('T')[0]}`)
      console.log(`   Oath Time: ${oathSchedule.oathTime}`)
      console.log(`   Location: ${oathSchedule.location}`)
    }
    
    console.log(`   Notifications Sent:`)
    
    for (const notif of applicantNotifications) {
      const statusEmoji = notif.status === 'BERJAYA' ? '✓' : '✗'
      const channelIcon = notif.channel === 'EMAIL' ? '📧' : notif.channel === 'SMS' ? '📱' : '💻'
      console.log(`     ${statusEmoji} ${channelIcon} ${notif.channel} - ${notif.status}`)
      if (notif.sentAt) {
        console.log(`        Sent: ${notif.sentAt.toISOString().split('T')[0]}`)
      }
      // Show first 80 chars of message
      if (notif.message) {
        const preview = notif.message.substring(0, 80).replace(/\n/g, ' ')
        console.log(`        Message: ${preview}...`)
      }
    }
    console.log()
    applicantIndex++
  }

  // Summary statistics
  const stats = {
    totalNotifications: notifications.length,
    byChannel: await prisma.notification.groupBy({
      by: ['channel'],
      _count: true,
    }),
    byStatus: await prisma.notification.groupBy({
      by: ['status'],
      _count: true,
    }),
    byRecipientType: await prisma.notification.groupBy({
      by: ['recipientType'],
      _count: true,
    }),
    successRate: {
      email: 0,
      sms: 0,
      system: 0,
      overall: 0
    }
  }

  // Calculate success rates
  const emailNotifs = notifications.filter(n => n.channel === 'EMAIL')
  const smsNotifs = notifications.filter(n => n.channel === 'SMS')
  const systemNotifs = notifications.filter(n => n.channel === 'SYSTEM')
  
  stats.successRate.email = emailNotifs.length > 0 
    ? (emailNotifs.filter(n => n.status === 'BERJAYA').length / emailNotifs.length * 100).toFixed(1) as any
    : 0
  stats.successRate.sms = smsNotifs.length > 0 
    ? (smsNotifs.filter(n => n.status === 'BERJAYA').length / smsNotifs.length * 100).toFixed(1) as any
    : 0
  stats.successRate.system = systemNotifs.length > 0 
    ? (systemNotifs.filter(n => n.status === 'BERJAYA').length / systemNotifs.length * 100).toFixed(1) as any
    : 0
  stats.successRate.overall = notifications.length > 0 
    ? (notifications.filter(n => n.status === 'BERJAYA').length / notifications.length * 100).toFixed(1) as any
    : 0

  console.log('========================================')
  console.log('SUMMARY STATISTICS')
  console.log('========================================')
  console.log(`Total Notifications: ${stats.totalNotifications}`)
  console.log(`Total Applicants Notified: ${notificationsByApplicant.size}`)
  
  console.log('\nBy Channel:')
  stats.byChannel.forEach(item => {
    console.log(`  ${item.channel}: ${item._count}`)
  })
  
  console.log('\nBy Status:')
  stats.byStatus.forEach(item => {
    console.log(`  ${item.status}: ${item._count}`)
  })
  
  console.log('\nBy Recipient Type:')
  stats.byRecipientType.forEach(item => {
    console.log(`  ${item.recipientType}: ${item._count}`)
  })
  
  console.log('\nSuccess Rates:')
  console.log(`  📧 EMAIL: ${stats.successRate.email}%`)
  console.log(`  📱 SMS: ${stats.successRate.sms}%`)
  console.log(`  💻 SYSTEM: ${stats.successRate.system}%`)
  console.log(`  Overall: ${stats.successRate.overall}%`)
  
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
