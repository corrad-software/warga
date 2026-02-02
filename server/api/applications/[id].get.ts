import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { createAuditLog } from '~/lib/utils/audit'

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
    
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            icNumber: true,
            phoneNumber: true,
            role: true,
            nationalityStatus: true,
            biometricStatus: true
          }
        },
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        certificates: true,
        workflowHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        }
      }
    })
    
    if (!application) {
      throw createError({
        statusCode: 404,
        message: 'Application not found'
      })
    }
    
    // Check permissions: users can only view their own applications, officers can view all
    if (currentUser.role === 'PEMOHON' && application.userId !== currentUser.id) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions'
      })
    }
    
    // Create audit log for viewing
    await createAuditLog({
      userId: currentUser.id,
      action: 'VIEW',
      entityType: 'Application',
      entityId: applicationId,
      metadata: {
        viewedBy: currentUser.id,
        viewedByRole: currentUser.role
      }
    })
    
    return {
      success: true,
      data: { application }
    }
  } catch (error: any) {
    console.error('Get application error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to get application'
    })
  }
})
