import { authenticateUser } from '~/lib/middleware/auth'
import { createAuditLog } from '~/lib/utils/audit'
import { executeTransition } from '~/lib/workflow/service'
import { getValidTransitions } from '~/lib/workflow/rules'
import type { ApplicationStatus } from '@prisma/client'

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

    const { toStatus, notes, metadata } = body

    if (!toStatus) {
      throw createError({
        statusCode: 400,
        message: 'Target status (toStatus) is required'
      })
    }

    // Validate status value
    const validStatuses: ApplicationStatus[] = [
      'DRAFT',
      'SUBMITTED',
      'PENDING_REVIEW',
      'DOCUMENTS_VERIFIED',
      'PENDING_BIOMETRIC',
      'BIOMETRIC_CAPTURED',
      'PENDING_PAYMENT',
      'PAYMENT_COMPLETED',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'PENDING_OATH',
      'OATH_COMPLETED',
      'CERTIFICATE_ISSUED',
      'COMPLETED'
    ]

    if (!validStatuses.includes(toStatus)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid status value'
      })
    }

    // Execute transition
    const result = await executeTransition({
      applicationId,
      toStatus,
      userId: currentUser.id,
      userRole: currentUser.role,
      notes,
      metadata
    })

    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error || 'Transition failed'
      })
    }

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      entityType: 'Application',
      entityId: applicationId,
      changes: {
        status: {
          before: result.application?.status,
          after: toStatus
        }
      },
      metadata: {
        transition: true,
        notes,
        ...metadata
      }
    })

    // Get valid next transitions for the user
    const validNextTransitions = getValidTransitions(toStatus, currentUser.role)

    return {
      success: true,
      data: {
        application: result.application,
        validNextTransitions
      }
    }
  } catch (error: any) {
    console.error('Transition error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to execute transition'
    })
  }
})
