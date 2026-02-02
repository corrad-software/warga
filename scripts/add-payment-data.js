import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db'
})

const prisma = new PrismaClient({ adapter })

async function addPaymentData() {
  console.log('Adding payment data for APP-2026-BH-0006...')

  try {
    // Find the application
    const application = await prisma.application.findUnique({
      where: { applicationNumber: 'APP-2026-BH-0006' },
      include: { user: true }
    })

    if (!application) {
      console.log('Application APP-2026-BH-0006 not found')
      return
    }

    console.log(`Found application: ${application.id}`)
    console.log(`User: ${application.user.name}`)

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentNumber: 'PAY-2025-1223-5678' }
    })

    if (existingPayment) {
      console.log('Payment already exists, deleting...')
      await prisma.payment.delete({
        where: { id: existingPayment.id }
      })
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        paymentNumber: 'PAY-2025-1223-5678',
        applicationId: application.id,
        userId: application.userId,
        amount: 300.00,
        currency: 'MYR',
        status: 'COMPLETED',
        method: 'ONLINE_BANKING',
        transactionId: 'TXN-MY-20251227-091200-ABC123',
        gatewayResponse: {
          gateway: 'FPX Malaysia',
          bankName: 'Maybank',
          bankCode: 'MBB0228',
          referenceNumber: 'FPX2025122709120012345',
          approvalCode: 'APP123456',
          responseCode: '00',
          responseMessage: 'Transaction Successful',
          cardType: null,
          maskedAccountNumber: '****1234',
          timestamp: '2025-12-27T09:12:00+08:00'
        },
        paidAt: new Date('2025-12-27T09:12:00'),
        createdAt: new Date('2025-12-27T08:45:00'),
        updatedAt: new Date('2025-12-27T09:12:00')
      }
    })

    console.log('\n✅ Payment created successfully!')
    console.log(`Payment Number: ${payment.paymentNumber}`)
    console.log(`Amount: ${payment.currency} ${payment.amount}`)
    console.log(`Method: ${payment.method}`)
    console.log(`Status: ${payment.status}`)
    console.log(`Transaction ID: ${payment.transactionId}`)
    console.log(`Paid At: ${payment.paidAt.toISOString()}`)

  } catch (error) {
    console.error('Error adding payment data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addPaymentData()
