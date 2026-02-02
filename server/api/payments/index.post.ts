import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { createPayment, calculatePaymentAmount } from '~/lib/services/payment'
import { createAuditLog } from '~/lib/utils/audit'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const { applicationId, method } = await readBody(event)

    if (!applicationId) {
      throw createError({
        statusCode: 400,
        message: 'Application ID is required'
      })
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        applicationNumber: true,
        userId: true,
        type: true,
        status: true
      }
    })

    if (!application) {
      throw createError({
        statusCode: 404,
        message: 'Application not found'
      })
    }

    // Verify user owns this application or is an officer/admin
    const isOwner = application.userId === currentUser.id
    const isOfficer = ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'].includes(currentUser.role)

    if (!isOwner && !isOfficer) {
      throw createError({
        statusCode: 403,
        message: 'Not authorized to create payment for this application'
      })
    }

    // Check if payment already exists and is completed
    const existingPayment = await prisma.payment.findFirst({
      where: {
        applicationId,
        status: 'COMPLETED'
      }
    })

    if (existingPayment) {
      throw createError({
        statusCode: 400,
        message: 'Payment already completed for this application'
      })
    }

    // Calculate payment amount
    const amount = calculatePaymentAmount(application.type)

    // Create payment
    const payment = await createPayment({
      applicationId,
      userId: currentUser.id,
      amount,
      method: method || undefined
    })

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE',
      entityType: 'Payment',
      entityId: payment.id,
      metadata: {
        paymentNumber: payment.paymentNumber,
        applicationId: payment.applicationId,
        amount: payment.amount,
        currency: payment.currency
      }
    })

    return {
      success: true,
      data: { payment }
    }
  } catch (error: any) {
    console.error('Payment creation error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create payment'
    })
  }
})
