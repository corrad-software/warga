import { authenticateUser } from '~/lib/middleware/auth'
import { getPaymentById } from '~/lib/services/payment'
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

    // Get payment
    const payment = await getPaymentById(id)

    if (!payment) {
      throw createError({
        statusCode: 404,
        message: 'Payment not found'
      })
    }

    // Authorization: only owner or officers can view
    const isOwner = payment.userId === currentUser.id
    const isOfficer = ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'].includes(currentUser.role)

    if (!isOwner && !isOfficer) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to view this payment'
      })
    }

    // Create audit log for viewing sensitive financial data
    await createAuditLog({
      userId: currentUser.id,
      action: 'VIEW',
      entityType: 'Payment',
      entityId: payment.id,
      metadata: {
        paymentNumber: payment.paymentNumber,
        amount: payment.amount
      }
    })

    return {
      success: true,
      data: { payment }
    }
  } catch (error: any) {
    console.error('Get payment error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to retrieve payment'
    })
  }
})
