import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Initialize Prisma with the adapter
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Updating payment amounts...')

  // Update PERMOHONAN payments to RM 10.00
  const permohonanResult = await prisma.payment.updateMany({
    where: {
      paymentType: 'PERMOHONAN'
    },
    data: {
      amount: 10.00
    }
  })

  console.log(`✓ Updated ${permohonanResult.count} PERMOHONAN payments to RM 10.00`)

  // Update SIJIL payments to RM 100.00
  const sijilResult = await prisma.payment.updateMany({
    where: {
      paymentType: 'SIJIL'
    },
    data: {
      amount: 100.00
    }
  })

  console.log(`✓ Updated ${sijilResult.count} SIJIL payments to RM 100.00`)

  // Summary
  const permohonanPayments = await prisma.payment.findMany({
    where: { paymentType: 'PERMOHONAN' },
    select: { amount: true }
  })

  const sijilPayments = await prisma.payment.findMany({
    where: { paymentType: 'SIJIL' },
    select: { amount: true }
  })

  const totalPayments = await prisma.payment.count()

  console.log('\n========================================')
  console.log('Payment Summary:')
  console.log('========================================')
  console.log(`Total Payments: ${totalPayments}`)
  console.log(`\nPERMOHONAN Payments: ${permohonanPayments.length}`)
  console.log(`  Amount: RM ${permohonanPayments[0]?.amount || 0}`)
  console.log(`\nSIJIL Payments: ${sijilPayments.length}`)
  console.log(`  Amount: RM ${sijilPayments[0]?.amount || 0}`)
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
