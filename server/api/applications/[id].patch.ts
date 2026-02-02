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
    
    const body = await readBody(event)
    
    // Get existing application
    const existingApplication = await prisma.application.findUnique({
      where: { id: applicationId }
    })
    
    if (!existingApplication) {
      throw createError({
        statusCode: 404,
        message: 'Application not found'
      })
    }
    
    // Check permissions
    if (currentUser.role === 'PEMOHON' && existingApplication.userId !== currentUser.id) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions'
      })
    }
    
    // PEMOHON can only update DRAFT applications
    if (currentUser.role === 'PEMOHON' && existingApplication.status !== 'DRAFT') {
      throw createError({
        statusCode: 400,
        message: 'Only draft applications can be updated'
      })
    }
    
    // Prepare update data
    const updateData: any = {}
    
    // PEMOHON can only update formData
    if (currentUser.role === 'PEMOHON') {
      if (body.formData !== undefined) {
        updateData.formData = body.formData
      }
    } else {
      // Officers can update more fields
      if (body.formData !== undefined) updateData.formData = body.formData
      if (body.consulatOfficerId !== undefined) updateData.consulatOfficerId = body.consulatOfficerId
      if (body.registrationOfficerId !== undefined) updateData.registrationOfficerId = body.registrationOfficerId
      if (body.decision !== undefined) updateData.decision = body.decision
      if (body.decisionReason !== undefined) updateData.decisionReason = body.decisionReason
      if (body.requiresOath !== undefined) updateData.requiresOath = body.requiresOath
      if (body.oathScheduledDate !== undefined) updateData.oathScheduledDate = body.oathScheduledDate
    }
    
    // Update application
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })
    
    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      entityType: 'Application',
      entityId: applicationId,
      changes: {
        before: existingApplication,
        after: application
      },
      metadata: {
        updatedBy: currentUser.id,
        updatedByRole: currentUser.role,
        updatedFields: Object.keys(updateData)
      }
    })
    
    return {
      success: true,
      data: { application }
    }
  } catch (error: any) {
    console.error('Update application error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to update application'
    })
  }
})
