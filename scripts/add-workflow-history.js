import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function addWorkflowHistory() {
  console.log('Adding workflow history for APP-2026-BH-0006...')

  try {
    // Find the application
    const application = await prisma.application.findUnique({
      where: { applicationNumber: 'APP-2026-BH-0006' }
    })

    if (!application) {
      console.log('Application APP-2026-BH-0006 not found')
      return
    }

    console.log(`Found application: ${application.id}`)

    // Delete existing workflow history for this application
    await prisma.workflowHistory.deleteMany({
      where: { applicationId: application.id }
    })

    console.log('Deleted existing workflow history')

    // Create detailed workflow history
    const workflowEntries = [
      {
        applicationId: application.id,
        fromStatus: null,
        toStatus: 'DRAFT',
        actionByRole: 'PEMOHON',
        notes: 'Application created and saved as draft',
        createdAt: new Date('2025-12-15T09:30:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'DRAFT',
        toStatus: 'SUBMITTED',
        actionByRole: 'PEMOHON',
        notes: 'Application submitted by applicant. All required documents attached.',
        createdAt: new Date('2025-12-15T14:22:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'SUBMITTED',
        toStatus: 'PENDING_REVIEW',
        actionByRole: 'PEGAWAI_PENDAFTARAN',
        notes: 'Initial review commenced. Application assigned to registration officer.',
        createdAt: new Date('2025-12-16T08:15:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'PENDING_REVIEW',
        toStatus: 'DOCUMENTS_VERIFIED',
        actionByRole: 'PEGAWAI_PENDAFTARAN',
        notes: 'All documents verified: Birth certificate from New York, parents IC, marriage certificate. Documents are authentic and in order.',
        createdAt: new Date('2025-12-18T11:45:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'DOCUMENTS_VERIFIED',
        toStatus: 'PENDING_BIOMETRIC',
        actionByRole: 'PEGAWAI_KONSUL',
        notes: 'Documents approved. Biometric data collection scheduled.',
        createdAt: new Date('2025-12-19T10:30:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'PENDING_BIOMETRIC',
        toStatus: 'BIOMETRIC_CAPTURED',
        actionByRole: 'PEGAWAI_KONSUL',
        notes: 'Biometric data successfully captured at Malaysian Consulate, New York. Face photo and fingerprints recorded.',
        createdAt: new Date('2025-12-23T15:20:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'BIOMETRIC_CAPTURED',
        toStatus: 'PENDING_PAYMENT',
        actionByRole: 'PEGAWAI_KONSUL',
        notes: 'Biometric verification complete. Payment required to proceed.',
        createdAt: new Date('2025-12-23T15:35:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'PENDING_PAYMENT',
        toStatus: 'PAYMENT_COMPLETED',
        actionByRole: 'ADMIN',
        notes: 'Payment of MYR 300.00 received via online banking. Receipt #PAY-2025-1223-5678',
        createdAt: new Date('2025-12-27T09:12:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'PAYMENT_COMPLETED',
        toStatus: 'UNDER_REVIEW',
        actionByRole: 'PEGAWAI_KONSUL',
        notes: 'Final review by consular officer. Verifying eligibility under Federal Constitution Article 14(1)(b) - child born outside Malaysia to Malaysian father.',
        createdAt: new Date('2025-12-30T13:45:00')
      },
      {
        applicationId: application.id,
        fromStatus: 'UNDER_REVIEW',
        toStatus: 'APPROVED',
        actionByRole: 'PEGAWAI_KONSUL',
        notes: 'Application APPROVED. Child meets citizenship criteria: Father (Ahmad Bin Abdullah, IC: 901234-01-5678) is Malaysian citizen, born in wedlock, birth properly registered. Registration certificate will be issued.',
        createdAt: new Date('2026-01-05T16:30:00')
      }
    ]

    // Insert all workflow entries
    for (const entry of workflowEntries) {
      await prisma.workflowHistory.create({
        data: entry
      })
      console.log(`✓ Created: ${entry.toStatus} (${entry.createdAt.toISOString().split('T')[0]})`)
    }

    console.log('\n✅ Workflow history added successfully!')
  } catch (error) {
    console.error('Error adding workflow history:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addWorkflowHistory()
