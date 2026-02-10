import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { getPaymentsByApplicationId, getPaymentsByUserId } from '~/lib/services/payment'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const query = getQuery(event)
    const { applicationId, userId } = query

    let payments: any[] = []

    if (applicationId) {
      // Get payments for specific application
      payments = await getPaymentsByApplicationId(applicationId as string)

      // Authorization check: only owner or officers can view
      if (payments.length > 0) {
        const firstPayment = payments[0]
        const isOwner = firstPayment.createdBy === currentUser.id
        const isOfficer = ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'].includes(currentUser.role)

        if (!isOwner && !isOfficer) {
          throw createError({
            statusCode: 403,
            message: 'Not authorized to view these payments'
          })
        }
      }
    } else if (userId) {
      // Get payments for specific user
      // Only admins or the user themselves can view
      const isOwnPayments = userId === currentUser.id
      const isAdmin = currentUser.role === 'ADMIN'

      if (!isOwnPayments && !isAdmin) {
        throw createError({
          statusCode: 403,
          message: 'Not authorized to view these payments'
        })
      }

      payments = await getPaymentsByUserId(userId as string)
    } else {
      // No filter provided
      const isOfficer = ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN'].includes(currentUser.role)
      if (isOfficer) {
        // Officers/admin see all payments
        payments = await prisma.payment.findMany({
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
          orderBy: { createdDate: 'desc' }
        })
      } else {
        // Regular users see only their own payments
        payments = await getPaymentsByUserId(currentUser.id)
      }
    }

    return {
      success: true,
      data: {
        payments,
        count: payments.length
      }
    }
  } catch (error: any) {
    console.error('Get payments error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to retrieve payments'
    })
  }
})
