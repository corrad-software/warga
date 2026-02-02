import { authenticateUser } from '~/lib/middleware/auth'
import { processRefund } from '~/lib/services/payment'
import { createAuditLog } from '~/lib/utils/audit'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Payment ID is required'
      })
    }

    // Only admins can process refunds
    if (currentUser.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        message: 'Only administrators can process refunds'
      })
    }

    const { reason } = await readBody(event)

    if (!reason) {
      throw createError({
        statusCode: 400,
        message: 'Refund reason is required'
      })
    }

    // Process refund
    const refundedPayment = await processRefund(id, reason)

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      entityType: 'Payment',
      entityId: refundedPayment.id,
      metadata: {
        action: 'refund',
        paymentNumber: refundedPayment.paymentNumber,
        amount: refundedPayment.amount,
        reason
      }
    })

    return {
      success: true,
      data: { payment: refundedPayment },
      message: 'Payment refunded successfully'
    }
  } catch (error: any) {
    console.error('Payment refund error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to process refund'
    })
  }
})
