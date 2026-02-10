import { prisma } from '../prisma'
import type { ApplicationType, PaymentStatus, PaymentMethod } from '../generated/prisma'

/**
 * Payment Service
 *
 * Handles payment processing, fee calculation, and payment verification
 */

export interface PaymentFees {
  [key: string]: number
}

// Fee structure based on application type (in MYR)
export const APPLICATION_FEES: PaymentFees = {
  BORANG_H: 300.00,  // Citizenship by registration
  BORANG_G: 500.00,  // Citizenship by naturalization
  TADBIR_SUMPAH: 100.00  // Oath administration
}

/**
 * Calculate payment amount based on application type
 */
export function calculatePaymentAmount(applicationType: ApplicationType): number {
  const amount = APPLICATION_FEES[applicationType]

  if (!amount) {
    throw new Error(`No fee defined for application type: ${applicationType}`)
  }

  return amount
}

/**
 * Generate unique payment number
 * Format: PAY-YYYYMMDD-XXXXX (e.g., PAY-20260131-00001)
 */
export async function generatePaymentNumber(): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const datePrefix = `${year}${month}${day}`

  // Get count of payments created today
  const startOfDay = new Date(year, now.getMonth(), now.getDate())
  const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1)

  const todayCount = await prisma.payment.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  })

  const sequence = String(todayCount + 1).padStart(5, '0')

  return `PAY-${datePrefix}-${sequence}`
}

/**
 * Create payment for an application
 */
export async function createPayment(data: {
  applicationId: string
  userId: string
  amount: number
  method?: PaymentMethod
  transactionId?: string
}): Promise<any> {
  const paymentNumber = await generatePaymentNumber()

  const payment = await prisma.payment.create({
    data: {
      paymentNumber,
      applicationId: data.applicationId,
      userId: data.userId,
      amount: data.amount,
      currency: 'MYR',
      status: 'PENDING',
      method: data.method || null,
      transactionId: data.transactionId || null
    },
    include: {
      application: {
        select: {
          id: true,
          applicationNumber: true,
          type: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return payment
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  data?: {
    transactionId?: string
    gatewayResponse?: any
    paidAt?: Date
  }
): Promise<any> {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      transactionId: data?.transactionId,
      gatewayResponse: data?.gatewayResponse || null,
      paidAt: data?.paidAt || (status === 'COMPLETED' ? new Date() : null)
    },
    include: {
      application: {
        select: {
          id: true,
          applicationNumber: true,
          type: true,
          status: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return payment
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<any> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      application: {
        select: {
          id: true,
          applicationNumber: true,
          type: true,
          status: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return payment
}

/**
 * Get payments for an application
 */
export async function getPaymentsByApplicationId(applicationId: string): Promise<any[]> {
  const payments = await prisma.payment.findMany({
    where: { applicationId: parseInt(applicationId) },
    include: {
      application: {
        select: {
          id: true,
          applicationRef: true,
          applicationType: true,
          status: true
        }
      }
    },
    orderBy: {
      createdDate: 'desc'
    }
  })

  return payments
}

/**
 * Get payments for a user
 */
export async function getPaymentsByUserId(userId: string): Promise<any[]> {
  const payments = await prisma.payment.findMany({
    where: { createdBy: userId },
    include: {
      application: {
        select: {
          id: true,
          applicationRef: true,
          applicationType: true,
          status: true
        }
      }
    },
    orderBy: {
      createdDate: 'desc'
    }
  })

  return payments
}

/**
 * Check if application has completed payment
 */
export async function hasCompletedPayment(applicationId: string): Promise<boolean> {
  const completedPayment = await prisma.payment.findFirst({
    where: {
      applicationId,
      status: 'COMPLETED'
    }
  })

  return !!completedPayment
}

/**
 * Verify payment status
 * This is a placeholder for payment gateway verification
 * In production, this would call the actual payment gateway API
 */
export async function verifyPaymentWithGateway(
  transactionId: string
): Promise<{
  verified: boolean
  status: PaymentStatus
  amount?: number
  paidAt?: Date
  gatewayResponse?: any
}> {
  // TODO: Implement actual payment gateway verification
  // For now, return a mock verification
  console.log(`[Payment] Mock verification for transaction: ${transactionId}`)

  return {
    verified: true,
    status: 'COMPLETED',
    amount: 0,
    paidAt: new Date(),
    gatewayResponse: {
      mock: true,
      message: 'Payment gateway integration not implemented'
    }
  }
}

/**
 * Process refund for a payment
 */
export async function processRefund(
  paymentId: string,
  reason: string
): Promise<any> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId }
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  if (payment.status !== 'COMPLETED') {
    throw new Error('Can only refund completed payments')
  }

  // TODO: Implement actual refund with payment gateway
  console.log(`[Payment] Mock refund for payment: ${paymentId}, reason: ${reason}`)

  const refundedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'REFUNDED',
      gatewayResponse: {
        ...(payment.gatewayResponse as object || {}),
        refund: {
          refundedAt: new Date(),
          reason,
          mock: true
        }
      }
    },
    include: {
      application: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  return refundedPayment
}
