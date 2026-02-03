import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function addAhmadApps() {
  console.log('Adding applications for Ahmad Bin Abdullah...\n')

  try {
    // Get Ahmad's user account
    const ahmad = await prisma.user.findUnique({
      where: {
        email: 'ahmad.abdullah@example.my'
      }
    })

    if (!ahmad) {
      console.log('Ahmad Bin Abdullah not found!')
      return
    }

    console.log(`Found user: ${ahmad.name} (${ahmad.email})`)

    const applications = [
      {
        userId: ahmad.id,
        type: 'BORANG_G',
        status: 'PENDING_REVIEW',
        applicationNumber: 'APP-2024-00123',
        formData: {
          parentInfo: {
            motherName: 'Siti Aminah binti Abdullah',
            motherIdentityType: 'MYKAD',
            motherIC: '850215-01-5432',
            motherPassportNo: '',
            motherNationality: 'Malaysian',
            motherPhoneNumber: '+60123456789',
            motherEmail: 'siti.aminah@email.com',
            motherAddress: 'No. 123, Jalan Bunga Raya, Taman Melati, 53000 Kuala Lumpur, Wilayah Persekutuan',

            fatherName: 'John Smith',
            fatherIdentityType: 'PASSPORT',
            fatherIC: '',
            fatherPassportNo: 'N12345678',
            fatherNationality: 'British',
            fatherPhoneNumber: '+60198765432',
            fatherEmail: 'john.smith@email.com',
            fatherAddress: '123 Oxford Street, London, United Kingdom'
          },
          childInfo: {
            fullName: 'Alya Sofia Smith',
            dateOfBirth: '2023-05-15',
            timeOfBirth: '14:30',
            placeOfBirth: 'London',
            hospitalName: "St. Mary's Hospital",
            stateOfBirth: 'Greater London',
            countryOfBirth: 'United Kingdom',
            gender: 'FEMALE',
            birthCertificateNo: 'UK-2023-12345',
            birthCertificateIssueDate: '2023-05-20',
            currentAddress: 'No. 123, Jalan Bunga Raya, Taman Melati, 53000 Kuala Lumpur, Wilayah Persekutuan',
            reasonForApplication: 'Child born abroad to Malaysian mother under Article 15(2) of the Federal Constitution. Mother is a Malaysian citizen by birth. Applying for Malaysian citizenship for the child.'
          }
        },
        submissionDate: new Date('2024-01-15')
      },
      {
        userId: ahmad.id,
        type: 'BORANG_G',
        status: 'UNDER_REVIEW',
        applicationNumber: 'APP-2024-00087',
        formData: {
          parentInfo: {
            motherName: 'Fatimah binti Hassan',
            motherIdentityType: 'MYKAD',
            motherIC: '880320-02-3456',
            motherPassportNo: '',
            motherNationality: 'Malaysian',
            motherPhoneNumber: '+60127654321',
            motherEmail: 'fatimah.hassan@email.com',
            motherAddress: 'No. 45, Jalan Merdeka, Taman Sri Sentosa, 43000 Kajang, Selangor',

            fatherName: 'David Brown',
            fatherIdentityType: 'PASSPORT',
            fatherIC: '',
            fatherPassportNo: 'P87654321',
            fatherNationality: 'Australian',
            fatherPhoneNumber: '+60199876543',
            fatherEmail: 'david.brown@email.com',
            fatherAddress: '789 Melbourne Street, Sydney, Australia'
          },
          childInfo: {
            fullName: 'Adam Daniel Brown',
            dateOfBirth: '2022-08-10',
            timeOfBirth: '09:15',
            placeOfBirth: 'Sydney',
            hospitalName: "Royal Prince Alfred Hospital",
            stateOfBirth: 'New South Wales',
            countryOfBirth: 'Australia',
            gender: 'MALE',
            birthCertificateNo: 'AU-2022-98765',
            birthCertificateIssueDate: '2022-08-15',
            currentAddress: 'No. 45, Jalan Merdeka, Taman Sri Sentosa, 43000 Kajang, Selangor',
            reasonForApplication: 'Applying for Malaysian citizenship for child born to Malaysian mother in Australia under Article 15(2).'
          }
        },
        submissionDate: new Date('2024-01-05'),
        reviewStartDate: new Date('2024-01-08')
      },
      {
        userId: ahmad.id,
        type: 'BORANG_G',
        status: 'APPROVED',
        applicationNumber: 'APP-2023-05421',
        formData: {
          parentInfo: {
            motherName: 'Noor Hidayah binti Rahman',
            motherIdentityType: 'MYKAD',
            motherIC: '890510-05-7890',
            motherPassportNo: '',
            motherNationality: 'Malaysian',
            motherPhoneNumber: '+60123334444',
            motherEmail: 'noor.hidayah@email.com',
            motherAddress: 'No. 78, Jalan Ampang, Taman Melawati, 53100 Kuala Lumpur',

            fatherName: 'Michael Johnson',
            fatherIdentityType: 'PASSPORT',
            fatherIC: '',
            fatherPassportNo: 'US123456789',
            fatherNationality: 'American',
            fatherPhoneNumber: '+60195554444',
            fatherEmail: 'michael.johnson@email.com',
            fatherAddress: '456 Fifth Avenue, New York, USA'
          },
          childInfo: {
            fullName: 'Sarah Emily Johnson',
            dateOfBirth: '2021-03-22',
            timeOfBirth: '16:45',
            placeOfBirth: 'New York',
            hospitalName: "Mount Sinai Hospital",
            stateOfBirth: 'New York',
            countryOfBirth: 'United States',
            gender: 'FEMALE',
            birthCertificateNo: 'US-2021-45678',
            birthCertificateIssueDate: '2021-03-25',
            currentAddress: 'No. 78, Jalan Ampang, Taman Melawati, 53100 Kuala Lumpur',
            reasonForApplication: 'Child born in USA to Malaysian mother. Applying for citizenship under Article 15(2).'
          }
        },
        submissionDate: new Date('2023-11-20'),
        reviewStartDate: new Date('2023-11-22'),
        decisionDate: new Date('2023-12-15'),
        decision: 'Approved',
        decisionReason: 'All requirements met. Mother is confirmed Malaysian citizen. Birth certificate and supporting documents verified.'
      }
    ]

    for (const appData of applications) {
      try {
        const existing = await prisma.application.findUnique({
          where: { applicationNumber: appData.applicationNumber }
        })

        if (existing) {
          console.log(`✓ ${appData.applicationNumber} already exists`)
          continue
        }

        const app = await prisma.application.create({
          data: appData
        })

        await prisma.workflowHistory.create({
          data: {
            applicationId: app.id,
            fromStatus: null,
            toStatus: app.status,
            actionByRole: 'PEMOHON',
            notes: `Application created and ${app.status === 'SUBMITTED' ? 'submitted' : 'in process'}`
          }
        })

        console.log(`✓ Created ${app.applicationNumber} - ${app.type} (${app.status})`)
      } catch (error) {
        console.error(`✗ Failed to create ${appData.applicationNumber}:`, error.message)
      }
    }

    console.log('\nDone! Ahmad Bin Abdullah now has applications.')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addAhmadApps()
