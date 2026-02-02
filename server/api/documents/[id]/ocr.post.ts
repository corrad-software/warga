import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { retryFailedOCR } from '~/lib/services/ocr-worker'
import { createAuditLog } from '~/lib/utils/audit'
import type { UserRole } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Document ID is required'
      })
    }

    // Only officers and admins can trigger manual OCR
    const allowedRoles: UserRole[] = ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN']
    if (!allowedRoles.includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Only officers can trigger manual OCR processing'
      })
    }

    // Get document
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true
          }
        }
      }
    })

    if (!document) {
      throw createError({
        statusCode: 404,
        message: 'Document not found'
      })
    }

    // Trigger OCR retry
    console.log(`[Manual OCR] Triggering OCR for document ${id}`)
    const success = await retryFailedOCR(id)

    if (!success) {
      throw createError({
        statusCode: 500,
        message: 'Failed to trigger OCR processing'
      })
    }

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      entityType: 'Document',
      entityId: document.id,
      metadata: {
        action: 'manual_ocr_trigger',
        applicationId: document.applicationId,
        documentType: document.documentType
      }
    })

    // Get updated document
    const updatedDocument = await prisma.document.findUnique({
      where: { id },
      include: {
        application: {
          select: {
            id: true,
            applicationNumber: true,
            type: true
          }
        }
      }
    })

    return {
      success: true,
      data: {
        document: updatedDocument,
        message: 'OCR processing triggered successfully'
      }
    }
  } catch (error: any) {
    console.error('Manual OCR trigger error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to trigger OCR'
    })
  }
})
