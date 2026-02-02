import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { getValidTransitions, getTransitionsFromStatus } from '~/lib/workflow/rules'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const applicationId = getRouterParam(event, 'id')

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
        userId: true,
        applicationNumber: true,
        status: true
      }
    })

    if (!application) {
      throw createError({
        statusCode: 404,
        message: 'Application not found'
      })
    }

    // Check if user has access to this application
    const hasAccess =
      application.userId === currentUser.id ||
      ['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(currentUser.role)

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    // Get valid transitions for current user's role
    const validTransitionsForUser = getValidTransitions(
      application.status,
      currentUser.role
    )

    // Get all possible transitions from current status (for reference)
    const allPossibleTransitions = getTransitionsFromStatus(application.status)

    return {
      success: true,
      data: {
        application: {
          id: application.id,
          applicationNumber: application.applicationNumber,
          currentStatus: application.status
        },
        validTransitions: validTransitionsForUser,
        allPossibleTransitions: allPossibleTransitions.map(rule => ({
          to: rule.to,
          allowedRoles: rule.allowedRoles,
          requiresDocuments: rule.requiresDocuments,
          requiresBiometric: rule.requiresBiometric,
          requiresPayment: rule.requiresPayment
        }))
      }
    }
  } catch (error: any) {
    console.error('Fetch valid transitions error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch valid transitions'
    })
  }
})
