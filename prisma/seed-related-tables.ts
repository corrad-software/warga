import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({
  adapter,
})

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to pick random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function main() {
  console.log('Seeding related tables...')

  // Get all applicants
  const applicants = await prisma.applicant.findMany()
  console.log(`Found ${applicants.length} applicants`)

  // ============================================
  // SEED SIBLINGS
  // ============================================
  console.log('Seeding siblings...')
  const siblingData = [
    { name: 'AHMAD BIN ABDULLAH', gender: 'M', country: 'MALAYSIA', nationality: 'MALAYSIA' },
    { name: 'FATIMAH BINTI ABDULLAH', gender: 'F', country: 'MALAYSIA', nationality: 'MALAYSIA' },
    { name: 'MOHD FAIZ BIN RAZALI', gender: 'M', country: 'SINGAPORE', nationality: 'SINGAPOREAN' },
    { name: 'NURUL AINI BINTI KAMAL', gender: 'F', country: 'AUSTRALIA', nationality: 'AUSTRALIAN' },
    { name: 'TAN AH KEAT', gender: 'M', country: 'MALAYSIA', nationality: 'MALAYSIA' },
    { name: 'LIM MEI FONG', gender: 'F', country: 'HONG KONG', nationality: 'HONG KONG SAR' },
    { name: 'KUMAR A/L RAJAN', gender: 'M', country: 'INDIA', nationality: 'INDIAN' },
    { name: 'PRIYA A/P SAMY', gender: 'F', country: 'MALAYSIA', nationality: 'MALAYSIA' },
    { name: 'WONG CHEE WEI', gender: 'M', country: 'TAIWAN', nationality: 'TAIWANESE' },
    { name: 'ZAINAB BINTI HASSAN', gender: 'F', country: 'UAE', nationality: 'UAE' },
  ]

  for (const applicant of applicants) {
    // Each applicant gets 1-3 siblings
    const numSiblings = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numSiblings; i++) {
      const sibling = randomItem(siblingData)
      await prisma.sibling.create({
        data: {
          applicantId: applicant.id,
          siblingName: sibling.name,
          gender: sibling.gender,
          dateOfBirth: randomDate(new Date('1985-01-01'), new Date('2000-12-31')),
          countryOfBirth: sibling.country,
          countryOfResidency: randomItem(['MALAYSIA', sibling.country]),
          nationality: sibling.nationality,
          createdBy: 'SYSTEM',
        }
      })
    }
  }
  console.log('Siblings seeded.')

  // ============================================
  // SEED PARENTS
  // ============================================
  console.log('Seeding parents...')
  const fatherNames = [
    'ABDULLAH BIN HASSAN', 'MOHD RAZALI BIN AHMAD', 'KAMAL BIN OSMAN', 'IBRAHIM BIN YUSOF',
    'TAN AH KOW', 'KUMAR A/L RAMAN', 'HASSAN BIN ALI', 'WONG CHEE KEONG',
    'ZAINAL BIN ABIDIN', 'RAZAK BIN MOHD', 'LEE CHONG WEI', 'SAMY A/L PILLAI',
    'MOHD NOOR BIN AHMAD', 'NG BOON KEAT', 'SUBRAMANIAM A/L KRISHNAN'
  ]
  
  const motherNames = [
    'ZAINAB BINTI OSMAN', 'SITI AMINAH BINTI ISMAIL', 'NOR AZIZAH BINTI YUSOF', 'FATIMAH BINTI ALI',
    'TAN AH MOI', 'LETCHUMI A/P RAMAN', 'AISHAH BINTI IBRAHIM', 'CHEN MEI LING',
    'NORHAYATI BINTI OMAR', 'ROSMAH BINTI MANSOR', 'LEE SOO FONG', 'KAVITHA A/P PILLAI',
    'HASLINDA BINTI KARIM', 'NG SOO YIN', 'LAKSHMI A/P KRISHNAN'
  ]

  for (let i = 0; i < applicants.length; i++) {
    const applicant = applicants[i]
    
    // Father
    await prisma.parent.create({
      data: {
        applicantId: applicant.id,
        parentCategory: 'BAPA',
        parentName: fatherNames[i % fatherNames.length],
        dateOfBirth: randomDate(new Date('1950-01-01'), new Date('1975-12-31')),
        placeOfBirth: randomItem(['KUALA LUMPUR', 'PENANG', 'JOHOR BAHRU', 'IPOH', 'KOTA KINABALU']),
        nationality: 'MALAYSIA',
        nationalityNo: `${Math.floor(Math.random() * 900000 + 100000)}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        race: randomItem(['MELAYU', 'CINA', 'INDIA']),
        religion: randomItem(['ISLAM', 'BUDDHA', 'HINDU', 'KRISTIAN']),
        idNumber: `${Math.floor(Math.random() * 900000 + 500000)}-01-${Math.floor(Math.random() * 9000 + 1000)}`,
        residency: 'WARGANEGARA',
        marriedDate: randomDate(new Date('1980-01-01'), new Date('1995-12-31')),
        marriedPlace: randomItem(['KUALA LUMPUR', 'PENANG', 'JOHOR BAHRU', 'SELANGOR']),
        createdBy: 'SYSTEM',
      }
    })

    // Mother
    await prisma.parent.create({
      data: {
        applicantId: applicant.id,
        parentCategory: 'IBU',
        parentName: motherNames[i % motherNames.length],
        parentNameBfrMarried: motherNames[i % motherNames.length].replace(' BINTI ', ' @ '),
        dateOfBirth: randomDate(new Date('1955-01-01'), new Date('1980-12-31')),
        placeOfBirth: randomItem(['KUALA LUMPUR', 'PENANG', 'JOHOR BAHRU', 'IPOH', 'MELAKA']),
        nationality: randomItem(['MALAYSIA', 'BRITISH', 'SINGAPOREAN', 'AUSTRALIAN']),
        race: randomItem(['MELAYU', 'CINA', 'INDIA']),
        religion: randomItem(['ISLAM', 'BUDDHA', 'HINDU', 'KRISTIAN']),
        idNumber: `${Math.floor(Math.random() * 900000 + 550000)}-07-${Math.floor(Math.random() * 9000 + 1000)}`,
        createdBy: 'SYSTEM',
      }
    })
  }
  console.log('Parents seeded.')

  // ============================================
  // SEED OFFENCE CONFINATION (only for a few applicants)
  // ============================================
  console.log('Seeding offence confination...')
  const offences = [
    { desc: 'Kesalahan trafik ringan', fine: 300, days: 0 },
    { desc: 'Melebihi had laju', fine: 500, days: 0 },
    { desc: 'Parkir di kawasan larangan', fine: 100, days: 0 },
  ]

  // Only 3 applicants have minor offences
  for (let i = 0; i < 3; i++) {
    const applicant = applicants[i * 4] // Every 4th applicant
    const offence = offences[i]
    await prisma.offenceConfination.create({
      data: {
        applicantId: applicant.id,
        offenceDesc: offence.desc,
        fineAmount: offence.fine,
        dateFrom: randomDate(new Date('2018-01-01'), new Date('2023-12-31')),
        country: 'MALAYSIA',
        totalConfinationDay: offence.days,
        createdBy: 'SYSTEM',
      }
    })
  }
  console.log('Offence confination seeded.')

  // ============================================
  // SEED PRE-APPLICATIONS
  // ============================================
  console.log('Seeding pre-applications...')
  const preAppStatuses = ['PRA_DAFTAR', 'PRA_LENGKAP', 'TIDAK_LENGKAP']
  const preApplicationIds: number[] = []

  for (let i = 0; i < applicants.length; i++) {
    const applicant = applicants[i]
    const preApp = await prisma.preApplication.create({
      data: {
        applicantId: applicant.id,
        subjectId: i + 1,
        status: i < 12 ? 'PRA_LENGKAP' : randomItem(preAppStatuses),
        submittedAt: randomDate(new Date('2024-01-01'), new Date('2025-12-31')),
        reviewedBy: i < 10 ? 1 : null,
        reviewedAt: i < 10 ? randomDate(new Date('2024-02-01'), new Date('2026-01-31')) : null,
        reviewNotes: i < 10 ? 'Dokumen lengkap dan disahkan' : null,
        createdBy: 'SYSTEM',
      }
    })
    preApplicationIds.push(preApp.id)
  }
  console.log('Pre-applications seeded.')

  // ============================================
  // SEED APPLICATIONS (linked to pre-applications)
  // ============================================
  console.log('Seeding applications...')
  const appStatuses = ['BARU', 'DALAM_SEMAKAN', 'MENUNGGU_DOKUMEN', 'DILULUSKAN', 'DITOLAK', 'SELESAI']
  const applicationIds: number[] = []

  for (let i = 0; i < 12; i++) { // Only first 12 have full applications
    const app = await prisma.application.create({
      data: {
        preAppId: preApplicationIds[i],
        applicationRef: `APP-2025-${String(i + 1).padStart(5, '0')}`,
        applicationType: 'PERKARA_15_2',
        status: i < 3 ? 'SELESAI' : i < 6 ? 'DILULUSKAN' : i < 9 ? 'DALAM_SEMAKAN' : 'BARU',
        registeredBy: 1,
        registeredAt: randomDate(new Date('2024-03-01'), new Date('2025-06-30')),
        createdBy: 'SYSTEM',
      }
    })
    applicationIds.push(app.id)
  }
  console.log('Applications seeded.')

  // ============================================
  // SEED DOCUMENTS
  // ============================================
  console.log('Seeding documents...')
  const documentTypes = [
    { type: 'SURAT_BERANAK', name: 'Sijil Kelahiran' },
    { type: 'PASPORT', name: 'Pasport' },
    { type: 'SIJIL_NIKAH', name: 'Sijil Perkahwinan Ibu Bapa' },
    { type: 'IC_BAPA', name: 'Kad Pengenalan Bapa' },
    { type: 'IC_IBU', name: 'Kad Pengenalan Ibu' },
    { type: 'SURAT_SOKONGAN', name: 'Surat Sokongan' },
    { type: 'GAMBAR_PASSPORT', name: 'Gambar Berukuran Pasport' },
  ]

  const docStatuses = ['DIMUATNAIK', 'DISAHKAN', 'TIDAK_DISAHKAN', 'PERLU_TAMBAHAN']

  for (const appId of applicationIds) {
    for (const docType of documentTypes) {
      const status = appId <= 6 ? 'DISAHKAN' : randomItem(docStatuses)
      await prisma.document.create({
        data: {
          applicationId: appId,
          documentType: docType.type,
          filePath: `/uploads/documents/${appId}/${docType.type.toLowerCase()}.pdf`,
          versionNo: 1,
          status: status,
          verifiedBy: status === 'DISAHKAN' ? 1 : null,
          verifiedAt: status === 'DISAHKAN' ? randomDate(new Date('2024-04-01'), new Date('2025-08-31')) : null,
          remarks: status === 'DISAHKAN' ? 'Dokumen sah dan lengkap' : null,
          createdBy: 'SYSTEM',
        }
      })
    }
  }
  console.log('Documents seeded.')

  // ============================================
  // SEED PAYMENTS
  // ============================================
  console.log('Seeding payments...')
  const paymentStatuses = ['BELUM_BAYAR', 'BERJAYA', 'GAGAL', 'MENUNGGU']
  const paymentIds: number[] = []

  for (let i = 0; i < applicationIds.length; i++) {
    const appId = applicationIds[i]
    const status = i < 6 ? 'BERJAYA' : i < 9 ? 'MENUNGGU' : 'BELUM_BAYAR'
    const payment = await prisma.payment.create({
      data: {
        applicationId: appId,
        billNo: `BILL-2025-${String(i + 1).padStart(6, '0')}`,
        amount: 100.00,
        paymentStatus: status,
        gatewayRef: status === 'BERJAYA' ? `FPX-${Date.now()}-${i}` : null,
        paidAt: status === 'BERJAYA' ? randomDate(new Date('2024-05-01'), new Date('2025-09-30')) : null,
        createdBy: 'SYSTEM',
      }
    })
    paymentIds.push(payment.id)
  }
  console.log('Payments seeded.')

  // ============================================
  // SEED PAYMENT RECEIPTS
  // ============================================
  console.log('Seeding payment receipts...')
  for (let i = 0; i < 6; i++) { // Only completed payments have receipts
    await prisma.paymentReceipt.create({
      data: {
        paymentId: paymentIds[i],
        applicationId: applicationIds[i],
        receiptNo: `RCP-2025-${String(i + 1).padStart(6, '0')}`,
        issuedAt: randomDate(new Date('2024-05-15'), new Date('2025-10-15')),
        createdBy: 'SYSTEM',
      }
    })
  }
  console.log('Payment receipts seeded.')

  // ============================================
  // SEED BIOMETRICS
  // ============================================
  console.log('Seeding biometrics...')
  const biometricStatuses = ['LENGKAP', 'TIDAK_LENGKAP', 'TIDAK_HADIR']

  for (let i = 0; i < applicationIds.length; i++) {
    const appId = applicationIds[i]
    const status = i < 8 ? 'LENGKAP' : randomItem(biometricStatuses)
    await prisma.biometric.create({
      data: {
        applicationId: appId,
        biometricType: 'FINGERPRINT',
        biometricHash: status === 'LENGKAP' ? `bio_hash_${appId}_${Date.now()}` : null,
        status: status,
        capturedBy: status === 'LENGKAP' ? 1 : null,
        capturedAt: status === 'LENGKAP' ? randomDate(new Date('2024-06-01'), new Date('2025-11-30')) : null,
        createdBy: 'SYSTEM',
      }
    })
  }
  console.log('Biometrics seeded.')

  // ============================================
  // SUMMARY
  // ============================================
  const counts = {
    siblings: await prisma.sibling.count(),
    parents: await prisma.parent.count(),
    offenceConf: await prisma.offenceConfination.count(),
    preApps: await prisma.preApplication.count(),
    applications: await prisma.application.count(),
    documents: await prisma.document.count(),
    payments: await prisma.payment.count(),
    receipts: await prisma.paymentReceipt.count(),
    biometrics: await prisma.biometric.count(),
  }

  console.log('\n========================================')
  console.log('Seeding completed successfully!')
  console.log('========================================')
  console.log(`Siblings:           ${counts.siblings}`)
  console.log(`Parents:            ${counts.parents}`)
  console.log(`Offence/Confination: ${counts.offenceConf}`)
  console.log(`Pre-Applications:   ${counts.preApps}`)
  console.log(`Applications:       ${counts.applications}`)
  console.log(`Documents:          ${counts.documents}`)
  console.log(`Payments:           ${counts.payments}`)
  console.log(`Payment Receipts:   ${counts.receipts}`)
  console.log(`Biometrics:         ${counts.biometrics}`)
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
