import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function seedApplications() {
  console.log('Starting to seed applications...')

  try {
    // Get existing users to create applications for
    const users = await prisma.user.findMany({
      where: {
        role: 'PEMOHON'
      },
      take: 3
    })

    if (users.length === 0) {
      console.log('No PEMOHON users found. Please run seed-users.js first.')
      return
    }

    const sampleApplications = [
      {
        userId: users[0].id,
        type: 'BORANG_H',
        status: 'SUBMITTED',
        applicationNumber: 'APP-2026-BH-0001',
        formData: {
          childName: users[0].name,
          placeOfBirth: 'London, United Kingdom',
          dateOfBirth: '2020-05-15',
          fatherName: 'Abdullah Bin Ahmad',
          fatherIC: '850101-01-1234',
          motherName: 'Siti Binti Hassan',
          motherIC: '870202-02-5678'
        },
        submissionDate: new Date('2026-01-15')
      },
      {
        userId: users[1].id,
        type: 'BORANG_G',
        status: 'PENDING_REVIEW',
        applicationNumber: 'APP-2026-BG-0002',
        formData: {
          applicantName: users[1].name,
          currentNationality: 'Malaysian (By Descent)',
          reasonForApplication: 'Article 15(2) application for citizenship confirmation',
          supportingDocuments: ['Birth certificate', 'Parents IC', 'Marriage certificate']
        },
        submissionDate: new Date('2026-01-18'),
        reviewStartDate: new Date('2026-01-20')
      },
      {
        userId: users[2] ? users[2].id : users[0].id,
        type: 'TADBIR_SUMPAH',
        status: 'PENDING_OATH',
        applicationNumber: 'APP-2026-TS-0003',
        formData: {
          applicantName: users[2] ? users[2].name : users[0].name,
          approvedApplicationNumber: 'APP-2025-BG-1234',
          preferredOathDate: '2026-02-15',
          location: 'Embassy of Malaysia, London'
        },
        submissionDate: new Date('2026-01-10'),
        reviewStartDate: new Date('2026-01-12'),
        decisionDate: new Date('2026-01-22'),
        decision: 'Approved',
        decisionReason: 'All requirements met, approved for oath ceremony',
        requiresOath: true,
        oathScheduledDate: new Date('2026-02-15')
      },
      {
        userId: users[0].id,
        type: 'BORANG_H',
        status: 'DOCUMENTS_VERIFIED',
        applicationNumber: 'APP-2026-BH-0004',
        formData: {
          childName: 'Aisyah Binti Ahmad',
          placeOfBirth: 'Paris, France',
          dateOfBirth: '2021-03-20',
          fatherName: 'Ahmad Bin Abdullah',
          fatherIC: users[0].icNumber,
          motherName: 'Fatimah Binti Ali',
          motherIC: '880303-03-9876'
        },
        submissionDate: new Date('2026-01-25'),
        reviewStartDate: new Date('2026-01-26')
      },
      {
        userId: users[1].id,
        type: 'BORANG_G',
        status: 'UNDER_REVIEW',
        applicationNumber: 'APP-2026-BG-0005',
        formData: {
          applicantName: users[1].name,
          currentNationality: 'British',
          reasonForApplication: 'Mother is Malaysian citizen, applying under Article 15(2)',
          supportingDocuments: ['Birth certificate', 'Mother IC', 'Parents marriage certificate', 'Proof of residence']
        },
        submissionDate: new Date('2026-01-20'),
        reviewStartDate: new Date('2026-01-22')
      },
      {
        userId: users[0].id,
        type: 'BORANG_H',
        status: 'APPROVED',
        applicationNumber: 'APP-2026-BH-0006',
        formData: {
          childName: 'Muhammad Bin Ahmad',
          placeOfBirth: 'New York, USA',
          dateOfBirth: '2019-08-10',
          fatherName: 'Ahmad Bin Abdullah',
          fatherIC: users[0].icNumber,
          motherName: 'Sarah Binti Ibrahim',
          motherIC: '890404-04-4321'
        },
        submissionDate: new Date('2025-12-15'),
        reviewStartDate: new Date('2025-12-16'),
        decisionDate: new Date('2026-01-05'),
        decision: 'Approved',
        decisionReason: 'Birth abroad registration approved. All documents verified and in order.'
      },
      {
        userId: users[2] ? users[2].id : users[1].id,
        type: 'BORANG_G',
        status: 'REJECTED',
        applicationNumber: 'APP-2026-BG-0007',
        formData: {
          applicantName: users[2] ? users[2].name : users[1].name,
          currentNationality: 'Australian',
          reasonForApplication: 'Grandfather was Malaysian citizen',
          supportingDocuments: ['Birth certificate', 'Grandfather documents']
        },
        submissionDate: new Date('2025-12-01'),
        reviewStartDate: new Date('2025-12-03'),
        decisionDate: new Date('2025-12-20'),
        decision: 'Rejected',
        decisionReason: 'Application does not meet the requirements under Article 15(2). Grandfather citizenship does not qualify for automatic citizenship grant.'
      },
      {
        userId: users[1].id,
        type: 'BORANG_H',
        status: 'PAYMENT_COMPLETED',
        applicationNumber: 'APP-2026-BH-0008',
        formData: {
          childName: 'Aliya Binti Hassan',
          placeOfBirth: 'Singapore',
          dateOfBirth: '2022-01-05',
          fatherName: 'Hassan Bin Omar',
          fatherIC: '840505-05-5678',
          motherName: users[1].name,
          motherIC: users[1].icNumber
        },
        submissionDate: new Date('2026-01-28'),
        reviewStartDate: new Date('2026-01-29')
      }
    ]

    for (const appData of sampleApplications) {
      try {
        // Check if application already exists
        const existingApp = await prisma.application.findUnique({
          where: { applicationNumber: appData.applicationNumber }
        })

        if (existingApp) {
          console.log(`Application ${appData.applicationNumber} already exists, skipping...`)
          continue
        }

        // Create application
        const application = await prisma.application.create({
          data: appData
        })

        // Create workflow history entry
        await prisma.workflowHistory.create({
          data: {
            applicationId: application.id,
            fromStatus: null,
            toStatus: application.status,
            actionByRole: 'PEMOHON',
            notes: `Application ${application.status === 'SUBMITTED' ? 'submitted' : 'created'}`
          }
        })

        console.log(`✓ Created application: ${application.applicationNumber} (${application.type} - ${application.status})`)
      } catch (error) {
        console.error(`✗ Failed to create application ${appData.applicationNumber}:`, error.message)
      }
    }

    console.log('\nSeeding completed!')
  } catch (error) {
    console.error('Seeding error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedApplications()
