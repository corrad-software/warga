import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function addDocumentData() {
  console.log('Adding document data for APP-2026-BH-0006...')

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

    // Delete existing documents
    await prisma.document.deleteMany({
      where: { applicationId: application.id }
    })
    console.log('Deleted existing documents')

    // Create sample documents
    const documents = [
      {
        applicationId: application.id,
        documentType: 'BIRTH_CERTIFICATE',
        fileName: 'birth-certificate-muhammad-ny.pdf',
        filePath: '/storage/documents/2025/12/birth-cert-ny-12345.pdf',
        fileSize: 1245789,
        mimeType: 'application/pdf',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2025-12-18T11:30:00'),
        uploadedAt: new Date('2025-12-15T14:15:00'),
        verificationNotes: 'Birth certificate from New York City Department of Health verified. Certificate number: BC-2019-NY-08-10-5678. All details match application.'
      },
      {
        applicationId: application.id,
        documentType: 'IC_PARENTS',
        fileName: 'father-ic-front.jpg',
        filePath: '/storage/documents/2025/12/father-ic-front-12345.jpg',
        fileSize: 856432,
        mimeType: 'image/jpeg',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2025-12-18T11:35:00'),
        uploadedAt: new Date('2025-12-15T14:16:00'),
        ocrResult: {
          icNumber: '901234-01-5678',
          name: 'AHMAD BIN ABDULLAH',
          dateOfBirth: '1990-12-04',
          placeOfBirth: 'KUALA LUMPUR',
          citizenship: 'WARGANEGARA',
          religion: 'ISLAM',
          address: 'NO. 15, JALAN MERDEKA 3/2, TAMAN MELATI, 53100 KUALA LUMPUR'
        },
        ocrProcessedAt: new Date('2025-12-15T14:17:00'),
        verificationNotes: 'Father IC verified. Malaysian citizen confirmed. IC number matches application.'
      },
      {
        applicationId: application.id,
        documentType: 'IC_PARENTS',
        fileName: 'mother-ic-front.jpg',
        filePath: '/storage/documents/2025/12/mother-ic-front-12345.jpg',
        fileSize: 892156,
        mimeType: 'image/jpeg',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2025-12-18T11:40:00'),
        uploadedAt: new Date('2025-12-15T14:17:00'),
        ocrResult: {
          icNumber: '890404-04-4321',
          name: 'SARAH BINTI IBRAHIM',
          dateOfBirth: '1989-04-04',
          placeOfBirth: 'IPOH',
          citizenship: 'WARGANEGARA',
          religion: 'ISLAM',
          address: 'NO. 15, JALAN MERDEKA 3/2, TAMAN MELATI, 53100 KUALA LUMPUR'
        },
        ocrProcessedAt: new Date('2025-12-15T14:18:00'),
        verificationNotes: 'Mother IC verified. Malaysian citizen confirmed.'
      },
      {
        applicationId: application.id,
        documentType: 'MARRIAGE_CERTIFICATE',
        fileName: 'parents-marriage-certificate.pdf',
        filePath: '/storage/documents/2025/12/marriage-cert-12345.pdf',
        fileSize: 967234,
        mimeType: 'application/pdf',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2025-12-18T11:45:00'),
        uploadedAt: new Date('2025-12-15T14:18:00'),
        verificationNotes: 'Marriage certificate verified. Registered in Selangor. Date: 2015-06-20. Both parents listed correctly.'
      },
      {
        applicationId: application.id,
        documentType: 'PASSPORT',
        fileName: 'child-passport.pdf',
        filePath: '/storage/documents/2025/12/child-passport-12345.pdf',
        fileSize: 1567890,
        mimeType: 'application/pdf',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2025-12-18T11:50:00'),
        uploadedAt: new Date('2025-12-15T14:19:00'),
        ocrResult: {
          passportNumber: 'A12345678',
          fullName: 'MUHAMMAD BIN AHMAD',
          dateOfBirth: '2019-08-10',
          placeOfBirth: 'NEW YORK, USA',
          nationality: 'MALAYSIAN',
          issueDate: '2020-01-15',
          expiryDate: '2025-01-14'
        },
        ocrProcessedAt: new Date('2025-12-15T14:20:00'),
        verificationNotes: 'Child Malaysian passport verified. Details consistent with birth certificate.'
      },
      {
        applicationId: application.id,
        documentType: 'SUPPORTING_LETTER',
        fileName: 'father-employment-letter.pdf',
        filePath: '/storage/documents/2025/12/employment-letter-12345.pdf',
        fileSize: 456789,
        mimeType: 'application/pdf',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date('2025-12-18T12:00:00'),
        uploadedAt: new Date('2025-12-15T14:20:00'),
        verificationNotes: 'Employment letter from Malaysian company confirming father\'s employment status during child\'s birth.'
      }
    ]

    for (const doc of documents) {
      const created = await prisma.document.create({
        data: doc
      })
      console.log(`✓ Created: ${doc.documentType} - ${doc.fileName}`)
    }

    console.log(`\n✅ ${documents.length} documents added successfully!`)

  } catch (error) {
    console.error('Error adding document data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addDocumentData()
