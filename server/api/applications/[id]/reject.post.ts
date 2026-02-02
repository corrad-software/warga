import { authenticateUser } from '~/lib/middleware/auth'
import { createAuditLog } from '~/lib/utils/audit'
import { rejectApplication } from '~/lib/workflow/service'
import type { UserRole } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const applicationId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!applicationId) {
      throw createError({
        statusCode: 400,
        message: 'Application ID is required'
      })
    }

    // Only consular officers and admins can reject
    const allowedRoles: UserRole[] = ['PEGAWAI_KONSUL', 'ADMIN']
    if (!allowedRoles.includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only consular officers can reject applications'
      })
    }

    const { decisionReason } = body

    if (!decisionReason) {
      throw createError({
        statusCode: 400,
        message: 'Decision reason is required for rejection'
      })
    }

    // Execute rejection
    const result = await rejectApplication(
      applicationId,
      currentUser.id,
      currentUser.role,
      decisionReason
    )

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error || 'Rejection failed'
      })
    }

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'REJECT',
      entityType: 'Application',
      entityId: applicationId,
      metadata: {
        decisionReason,
        newStatus: 'REJECTED'
      }
    })

    return {
      success: true,
      data: {
        application: result.application,
        message: 'Application rejected'
      }
    }
  } catch (error: any) {
    console.error('Rejection error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to reject application'
    })
  }
})
