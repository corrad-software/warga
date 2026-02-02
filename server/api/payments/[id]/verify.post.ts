import { authenticateUser } from '~/lib/middleware/auth'
import { getPaymentById, updatePaymentStatus } from '~/lib/services/payment'
import { createAuditLog } from '~/lib/utils/audit'
import type { UserRole, PaymentStatus } from '@prisma/client'

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

    // Only officers and admins can verify payments
    const allowedRoles: UserRole[] = ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN']
    if (!allowedRoles.includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only officers can verify payments'
      })
    }

    const { status, transactionId, notes } = await readBody(event)

    if (!status) {
      throw createError({
        statusCode: 400,
        message: 'Payment status is required'
      })
    }

    // Validate status
    const validStatuses: PaymentStatus[] = ['COMPLETED', 'FAILED']
    if (!validStatuses.includes(status)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid payment status. Must be COMPLETED or FAILED'
      })
    }

    // Get payment
    const payment = await getPaymentById(id)

    if (!payment) {
      throw createError({
        statusCode: 404,
        message: 'Payment not found'
      })
    }

    // Check if payment is in valid state to be verified
    if (payment.status === 'COMPLETED' || payment.status === 'REFUNDED') {
      throw createError({
        statusCode: 400,
        message: `Cannot verify payment with status ${payment.status}`
      })
    }

    // Update payment status
    const updatedPayment = await updatePaymentStatus(id, status, {
      transactionId: transactionId || undefined,
      paidAt: status === 'COMPLETED' ? new Date() : undefined,
      gatewayResponse: {
        verifiedBy: currentUser.id,
        verifiedAt: new Date(),
        notes: notes || null,
        manualVerification: true
      }
    })

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      entityType: 'Payment',
      entityId: payment.id,
      metadata: {
        action: 'verify',
        paymentNumber: payment.paymentNumber,
        oldStatus: payment.status,
        newStatus: status,
        transactionId
      }
    })

    return {
      success: true,
      data: { payment: updatedPayment },
      message: `Payment ${status === 'COMPLETED' ? 'verified' : 'marked as failed'} successfully`
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to verify payment'
    })
  }
})
