import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedNotifications() {
  try {
    // Get first user (applicant)
    const user = await prisma.user.findFirst({
      where: { role: 'PEMOHON' }
    })

    if (!user) {
      console.log('No user found. Please create a user first.')
      return
    }

    console.log('Found user:', user.email)

    // Get user's applications
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      take: 3
    })

    console.log('Found', applications.length, 'applications')

    const notifications = [
      {
        userId: user.id,
        applicationId: applications[0]?.id,
        applicationNumber: applications[0]?.applicationNumber,
        type: 'SYSTEM' as const,
        status: 'SENT' as const,
        subject: 'Application Submitted Successfully',
        message: 'Your citizenship application has been submitted successfully. You will receive updates as your application progresses through the review process.',
        sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user.id,
        applicationId: applications[0]?.id,
        applicationNumber: applications[0]?.applicationNumber,
        type: 'SYSTEM' as const,
        status: 'SENT' as const,
        subject: 'Documents Under Review',
        message: 'Your submitted documents are currently being reviewed by our verification team. This process typically takes 3-5 business days.',
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user.id,
        applicationId: applications[0]?.id,
        applicationNumber: applications[0]?.applicationNumber,
        type: 'SYSTEM' as const,
        status: 'SENT' as const,
        subject: 'Payment Required',
        message: 'Your documents have been verified. Please proceed with the payment of RM 350.00 to continue processing your application.',
        sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        userId: user.id,
        type: 'SYSTEM' as const,
        status: 'SENT' as const,
        subject: 'Welcome to SPK',
        message: 'Welcome to Sistem Pengurusan Kewarganegaraan. You can now submit citizenship applications and track their progress online.',
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        userId: user.id,
        applicationId: applications[1]?.id,
        applicationNumber: applications[1]?.applicationNumber,
        type: 'SYSTEM' as const,
        status: 'SENT' as const,
        subject: 'Biometric Appointment Scheduled',
        message: 'Your biometric capture appointment has been scheduled for next Monday at 10:00 AM at the Malaysian Consulate.',
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ]

    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification
      })
    }

    console.log('✓ Seeded', notifications.length, 'notifications')
  } catch (error) {
    console.error('Error seeding notifications:', error)
    throw error
  }
}

seedNotifications()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
