import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { generateApplicationNumber } from '~/lib/utils/generators'
import { createAuditLog } from '~/lib/utils/audit'
import type { ApplicationType } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const body = await readBody(event)
    
    const { type, formData } = body
    
    if (!type) {
      throw createError({
        statusCode: 400,
        message: 'Application type is required'
      })
    }
    
    // Validate application type
    const validTypes: ApplicationType[] = ['BORANG_H', 'BORANG_G', 'TADBIR_SUMPAH']
    if (!validTypes.includes(type)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid application type'
      })
    }
    
    // Generate unique application number
    const applicationNumber = await generateApplicationNumber(type)
    
    // Create application
    const application = await prisma.application.create({
      data: {
        applicationNumber,
        userId: currentUser.id,
        type,
        status: 'DRAFT',
        formData: formData || {}
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })
    
    // Create workflow history
    await prisma.workflowHistory.create({
      data: {
        applicationId: application.id,
        fromStatus: null,
        toStatus: 'DRAFT',
        actionBy: currentUser.id,
        actionByRole: currentUser.role,
        notes: 'Application created'
      }
    })
    
    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE',
      entityType: 'Application',
      entityId: application.id,
      metadata: {
        applicationNumber,
        type,
        status: 'DRAFT'
      }
    })
    
    return {
      success: true,
      data: { application }
    }
  } catch (error: any) {
    console.error('Create application error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to create application'
    })
  }
})
