import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { createAuditLog } from '~/lib/utils/audit'
import type { DocumentVerificationStatus, UserRole } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Document ID is required'
      })
    }

    // Get existing document
    const existingDocument = await prisma.document.findUnique({
      where: { id },
      include: {
        application: true
      }
    })

    if (!existingDocument) {
      throw createError({
        statusCode: 404,
        message: 'Document not found'
      })
    }

    const { verificationStatus, verificationNotes, ocrResult } = body

    // Only officers and admins can verify documents
    if (verificationStatus && verificationStatus !== 'PENDING') {
      const allowedRoles: UserRole[] = ['PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN', 'ADMIN']
      if (!allowedRoles.includes(currentUser.role)) {
        throw createError({
          statusCode: 403,
          message: 'Insufficient permissions'
        })
      }
    }

    // Build update data
    const updateData: any = {}

    if (verificationStatus) {
      const validStatuses: DocumentVerificationStatus[] = [
        'PENDING',
        'OCR_PROCESSING',
        'OCR_COMPLETED',
        'VERIFIED',
        'REJECTED',
        'REQUIRES_MANUAL_CHECK'
      ]

      if (!validStatuses.includes(verificationStatus)) {
        throw createError({
          statusCode: 400,
          message: 'Invalid verification status'
        })
      }

      updateData.verificationStatus = verificationStatus

      // Set verifiedBy and verifiedAt for final statuses
      if (['VERIFIED', 'REJECTED'].includes(verificationStatus)) {
        updateData.verifiedBy = currentUser.id
        updateData.verifiedAt = new Date()
      }
    }

    if (verificationNotes !== undefined) {
      updateData.verificationNotes = verificationNotes
    }

    if (ocrResult !== undefined) {
      updateData.ocrResult = ocrResult
      updateData.ocrProcessedAt = new Date()
    }

    // Update document
    const document = await prisma.document.update({
      where: { id },
      data: updateData,
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

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      entityType: 'Document',
      entityId: document.id,
      changes: {
        before: {
          verificationStatus: existingDocument.verificationStatus,
          verificationNotes: existingDocument.verificationNotes
        },
        after: {
          verificationStatus: document.verificationStatus,
          verificationNotes: document.verificationNotes
        }
      },
      metadata: {
        applicationId: document.applicationId,
        documentType: document.documentType
      }
    })

    return {
      success: true,
      data: { document }
    }
  } catch (error: any) {
    console.error('Update document error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update document'
    })
  }
})
