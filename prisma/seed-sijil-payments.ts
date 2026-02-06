import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Initialize Prisma with the adapter
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

// Helper function for random date
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function main() {
  console.log('Adding SIJIL (Certificate) payments...')

  // Get applications that have successful application payments
  const applications = await prisma.application.findMany({
    where: {
      payments: {
        some: {
          paymentStatus: 'BERJAYA',
          paymentType: 'PERMOHONAN'
        }
      }
    },
    take: 5, // Add certificate payments for first 5 applications
    include: {
      payments: true
    }
  })

  console.log(`Found ${applications.length} applications with successful payments`)

  let addedCount = 0
  
  for (const app of applications) {
    // Check if this application already has a SIJIL payment
    const hasSijilPayment = app.payments.some(p => p.paymentType === 'SIJIL')
    
    if (!hasSijilPayment) {
      // Add certificate payment
      await prisma.payment.create({
        data: {
          applicationId: app.id,
          billNo: `CERT-2025-${String(app.id).padStart(6, '0')}`,
          amount: 50.00,
          paymentStatus: 'BERJAYA',
          paymentType: 'SIJIL',
          gatewayRef: `FPX-CERT-${Date.now()}-${app.id}`,
          paidAt: randomDate(new Date('2024-06-01'), new Date('2025-12-31')),
          createdBy: 'SYSTEM',
        }
      })
      addedCount++
      console.log(`✓ Added SIJIL payment for application ${app.applicationRef || app.id}`)
    } else {
      console.log(`- Application ${app.applicationRef || app.id} already has SIJIL payment`)
    }
  }

  // Summary
  const totalPayments = await prisma.payment.count()
  const permohonanCount = await prisma.payment.count({ where: { paymentType: 'PERMOHONAN' }})
  const sijilCount = await prisma.payment.count({ where: { paymentType: 'SIJIL' }})
  
  console.log('\n========================================')
  console.log('Payment Summary:')
  console.log('========================================')
  console.log(`Total Payments:     ${totalPayments}`)
  console.log(`PERMOHONAN:         ${permohonanCount}`)
  console.log(`SIJIL:              ${sijilCount}`)
  console.log(`Added SIJIL:        ${addedCount}`)
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
