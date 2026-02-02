import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

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

    // Verify application exists and user has access
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

    // Get workflow history
    const history = await prisma.workflowHistory.findMany({
      where: {
        applicationId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return {
      success: true,
      data: {
        application: {
          id: application.id,
          applicationNumber: application.applicationNumber,
          currentStatus: application.status
        },
        history
      }
    }
  } catch (error: any) {
    console.error('Fetch workflow history error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch workflow history'
    })
  }
})
