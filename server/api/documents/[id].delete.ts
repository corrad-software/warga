import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { deleteFile } from '~/lib/utils/upload'
import { createAuditLog } from '~/lib/utils/audit'

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

    // Get document with application details
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        application: true
      }
    })

    if (!document) {
      throw createError({
        statusCode: 404,
        message: 'Document not found'
      })
    }

    // Check access permissions - only document owner or officers/admins can delete
    const hasAccess =
      document.application.userId === currentUser.id ||
      ['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(currentUser.role)

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    // Delete file from storage
    deleteFile(document.filePath)

    // Delete document record from database
    await prisma.document.delete({
      where: { id }
    })

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'DELETE',
      entityType: 'Document',
      entityId: document.id,
      metadata: {
        applicationId: document.applicationId,
        documentType: document.documentType,
        fileName: document.fileName,
        deletedFilePath: document.filePath
      }
    })

    return {
      success: true,
      message: 'Document deleted successfully'
    }
  } catch (error: any) {
    console.error('Delete document error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to delete document'
    })
  }
})
