import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Initialize Prisma with the adapter - use the same database as the project
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Updating existing payment records with payment_type = PERMOHONAN...')

  try {
    // Update all payments that don't have a payment_type set
    const result = await prisma.payment.updateMany({
      where: {
        paymentType: null
      },
      data: {
        paymentType: 'PERMOHONAN'
      }
    })

    console.log(`✓ Updated ${result.count} payment records`)
    
    // Show summary
    const total = await prisma.payment.count()
    const permohonan = await prisma.payment.count({ where: { paymentType: 'PERMOHONAN' }})
    const sijil = await prisma.payment.count({ where: { paymentType: 'SIJIL' }})
    const unset = await prisma.payment.count({ where: { paymentType: null }})
    
    console.log('\n========================================')
    console.log('Payment Type Summary:')
    console.log('========================================')
    console.log(`Total Payments:     ${total}`)
    console.log(`PERMOHONAN:         ${permohonan}`)
    console.log(`SIJIL:              ${sijil}`)
    console.log(`Unset:              ${unset}`)
    console.log('========================================')
  } catch (error) {
    console.error('Error updating payment types:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
