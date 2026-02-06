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

// Helper to format date in Malay/English
function formatDate(date: Date): string {
  const months = ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// Message templates for different oath statuses
function generateOathNotificationMessages(applicantName: string, oathDate: Date, oathTime: string, location: string, status: string) {
  const formattedDate = formatDate(oathDate)
  
  const templates = {
    DIJADUALKAN: {
      EMAIL: {
        en: `Dear ${applicantName},

Your oath ceremony has been scheduled as follows:

Date: ${formattedDate}
Time: ${oathTime}
Location: ${location}

Please arrive 15 minutes before the scheduled time and bring:
- Original identification documents
- Application reference letter
- Any required supporting documents

If you need to reschedule, please contact us at least 3 days in advance.

Best regards,
Jabatan Pendaftaran Negara Malaysia`,
        bm: `Kepada ${applicantName},

Upacara mengangkat sumpah anda telah dijadualkan seperti berikut:

Tarikh: ${formattedDate}
Masa: ${oathTime}
Lokasi: ${location}

Sila hadir 15 minit lebih awal dan bawa:
- Dokumen pengenalan asal
- Surat rujukan permohonan
- Dokumen sokongan yang diperlukan

Jika anda perlu menjadual semula, sila hubungi kami sekurang-kurangnya 3 hari lebih awal.

Sekian, terima kasih.
Jabatan Pendaftaran Negara Malaysia`
      },
      SMS: {
        en: `${applicantName}, your oath ceremony is scheduled on ${formattedDate} at ${oathTime}. Location: ${location}. Please arrive 15 mins early.`,
        bm: `${applicantName}, upacara sumpah anda dijadualkan pada ${formattedDate} jam ${oathTime}. Lokasi: ${location}. Sila hadir 15 minit awal.`
      },
      SYSTEM: {
        en: `Oath ceremony scheduled for ${formattedDate} at ${oathTime}`,
        bm: `Upacara sumpah dijadualkan pada ${formattedDate} jam ${oathTime}`
      }
    },
    SELESAI: {
      EMAIL: {
        en: `Dear ${applicantName},

Congratulations! Your oath ceremony was successfully completed on ${formattedDate}.

Your citizenship certificate will be processed and ready for collection within 14 working days.

We will notify you once your certificate is ready for collection.

Best regards,
Jabatan Pendaftaran Negara Malaysia`,
        bm: `Kepada ${applicantName},

Tahniah! Upacara mengangkat sumpah anda telah selesai dengan jayanya pada ${formattedDate}.

Sijil kewarganegaraan anda akan diproses dan sedia untuk diambil dalam tempoh 14 hari bekerja.

Kami akan memaklumkan anda apabila sijil anda sedia untuk diambil.

Sekian, terima kasih.
Jabatan Pendaftaran Negara Malaysia`
      },
      SMS: {
        en: `Congratulations ${applicantName}! Oath ceremony completed on ${formattedDate}. Certificate will be ready in 14 working days.`,
        bm: `Tahniah ${applicantName}! Upacara sumpah selesai pada ${formattedDate}. Sijil akan sedia dalam 14 hari bekerja.`
      },
      SYSTEM: {
        en: `Oath ceremony completed successfully on ${formattedDate}`,
        bm: `Upacara sumpah selesai dengan jayanya pada ${formattedDate}`
      }
    },
    DITANGGUH: {
      EMAIL: {
        en: `Dear ${applicantName},

Your oath ceremony originally scheduled for ${formattedDate} has been postponed.

We apologize for any inconvenience. A new date will be assigned soon and you will be notified accordingly.

If you have any questions, please contact our office.

Best regards,
Jabatan Pendaftaran Negara Malaysia`,
        bm: `Kepada ${applicantName},

Upacara mengangkat sumpah anda yang dijadualkan pada ${formattedDate} telah ditangguhkan.

Kami memohon maaf atas sebarang kesulitan. Tarikh baharu akan ditetapkan tidak lama lagi dan anda akan dimaklumkan.

Jika anda mempunyai sebarang pertanyaan, sila hubungi pejabat kami.

Sekian, terima kasih.
Jabatan Pendaftaran Negara Malaysia`
      },
      SMS: {
        en: `${applicantName}, your oath ceremony scheduled for ${formattedDate} has been postponed. New date will be notified soon.`,
        bm: `${applicantName}, upacara sumpah pada ${formattedDate} telah ditangguhkan. Tarikh baharu akan dimaklumkan tidak lama lagi.`
      },
      SYSTEM: {
        en: `Oath ceremony postponed - originally scheduled for ${formattedDate}`,
        bm: `Upacara sumpah ditangguhkan - asal dijadualkan pada ${formattedDate}`
      }
    },
    TIDAK_HADIR: {
      EMAIL: {
        en: `Dear ${applicantName},

We note that you did not attend your scheduled oath ceremony on ${formattedDate}.

If you were unable to attend due to an emergency, please contact our office immediately to reschedule.

Failure to attend without valid reason may affect your application.

Best regards,
Jabatan Pendaftaran Negara Malaysia`,
        bm: `Kepada ${applicantName},

Kami perhatikan bahawa anda tidak hadir ke upacara sumpah yang dijadualkan pada ${formattedDate}.

Jika anda tidak dapat hadir kerana kecemasan, sila hubungi pejabat kami segera untuk menjadual semula.

Kegagalan hadir tanpa alasan yang sah boleh menjejaskan permohonan anda.

Sekian, terima kasih.
Jabatan Pendaftaran Negara Malaysia`
      },
      SMS: {
        en: `${applicantName}, you missed your oath ceremony on ${formattedDate}. Please contact us immediately to reschedule.`,
        bm: `${applicantName}, anda tidak hadir ke upacara sumpah pada ${formattedDate}. Sila hubungi kami segera untuk jadual semula.`
      },
      SYSTEM: {
        en: `Applicant did not attend oath ceremony on ${formattedDate}`,
        bm: `Pemohon tidak hadir ke upacara sumpah pada ${formattedDate}`
      }
    }
  }
  
  return templates[status as keyof typeof templates]
}

async function main() {
  console.log('Seeding oath schedule notifications...\n')

  // Get all oath schedules with related data
  const oathSchedules = await prisma.oathSchedule.findMany({
    include: {
      application: {
        include: {
          preApplication: {
            include: {
              applicant: true
            }
          }
        }
      }
    },
    orderBy: {
      oathDate: 'asc'
    }
  })

  if (oathSchedules.length === 0) {
    console.log('No oath schedules found. Please run seed-oath-schedules.ts first.')
    return
  }

  console.log(`Found ${oathSchedules.length} oath schedules to create notifications for.\n`)

  let createdCount = 0
  let skippedCount = 0

  for (const schedule of oathSchedules) {
    const applicant = schedule.application?.preApplication?.applicant
    if (!applicant || !schedule.application) {
      console.log(`⚠ Skipping schedule ID ${schedule.id} - missing applicant or application data`)
      skippedCount++
      continue
    }

    const applicantName = applicant.fullName
    const oathDate = schedule.oathDate || new Date()
    const oathTime = schedule.oathTime || '09:00'
    const location = schedule.location || 'TBA'
    const status = schedule.status || 'DIJADUALKAN'

    const messages = generateOathNotificationMessages(applicantName, oathDate, oathTime, location, status)

    if (!messages) {
      console.log(`⚠ Skipping schedule ID ${schedule.id} - invalid status: ${status}`)
      skippedCount++
      continue
    }

    // Create notifications for different channels
    const channels = ['EMAIL', 'SMS', 'SYSTEM'] as const
    
    for (const channel of channels) {
      try {
        // Check if notification already exists
        const existing = await prisma.notification.findFirst({
          where: {
            applicationId: schedule.applicationId,
            channel: channel,
            message: {
              contains: status === 'DIJADUALKAN' ? 'scheduled' : status === 'SELESAI' ? 'completed' : status
            }
          }
        })

        if (existing) {
          skippedCount++
          continue
        }

        // Determine notification status (mostly successful, some failed for variety)
        const notificationStatus = Math.random() > 0.85 ? 'GAGAL' : 'BERJAYA'
        
        // Determine sent date based on oath status
        let sentAt: Date
        if (status === 'DIJADUALKAN') {
          // Sent 7-14 days before oath date
          const daysBeforeOath = Math.floor(Math.random() * 7) + 7
          sentAt = new Date(oathDate)
          sentAt.setDate(sentAt.getDate() - daysBeforeOath)
        } else if (status === 'SELESAI') {
          // Sent 1-2 days after oath completion
          sentAt = new Date(oathDate)
          sentAt.setDate(sentAt.getDate() + Math.floor(Math.random() * 2) + 1)
        } else if (status === 'DITANGGUH' || status === 'TIDAK_HADIR') {
          // Sent 1 day after the event
          sentAt = new Date(oathDate)
          sentAt.setDate(sentAt.getDate() + 1)
        } else {
          sentAt = new Date()
        }

        const message = messages[channel].bm // Using Bahasa Malaysia version

        await prisma.notification.create({
          data: {
            applicationId: schedule.applicationId,
            recipientType: 'PEMOHON',
            channel: channel,
            message: message,
            status: notificationStatus,
            sentAt: notificationStatus === 'BERJAYA' ? sentAt : null,
            createdBy: 'SYSTEM',
          }
        })

        createdCount++
        const statusEmoji = notificationStatus === 'BERJAYA' ? '✓' : '✗'
        console.log(`${statusEmoji} Created ${channel} notification for ${applicantName} (${status})`)
      } catch (error: any) {
        console.error(`✗ Failed to create ${channel} notification:`, error.message)
      }
    }

    console.log() // Empty line for readability
  }

  // Summary
  const totalNotifications = await prisma.notification.count()
  const notificationBreakdown = await prisma.notification.groupBy({
    by: ['channel', 'status'],
    _count: true,
  })

  console.log('========================================')
  console.log('OATH NOTIFICATIONS SEEDING COMPLETED!')
  console.log('========================================')
  console.log(`Total Notifications in DB: ${totalNotifications}`)
  console.log(`Newly Created: ${createdCount}`)
  console.log(`Skipped: ${skippedCount}\n`)
  
  console.log('Breakdown by Channel and Status:')
  const channels = ['EMAIL', 'SMS', 'SYSTEM']
  const statuses = ['BERJAYA', 'GAGAL']
  
  for (const channel of channels) {
    console.log(`\n${channel}:`)
    for (const status of statuses) {
      const item = notificationBreakdown.find(n => n.channel === channel && n.status === status)
      console.log(`  ${status}: ${item?._count || 0}`)
    }
  }
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
