import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { getFile } from '~/lib/utils/upload'
import { createAuditLog } from '~/lib/utils/audit'
import path from 'path'

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
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
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

    // Check access permissions
    const hasAccess =
      document.application.userId === currentUser.id ||
      ['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(currentUser.role)

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    // Get file from storage
    const fileBuffer = getFile(document.filePath)

    if (!fileBuffer) {
      throw createError({
        statusCode: 404,
        message: 'File not found in storage'
      })
    }

    // Check if inline view is requested (default is download)
    const query = getQuery(event)
    const inline = query.inline === 'true'

    // Set response headers
    setHeaders(event, {
      'Content-Type': document.mimeType,
      'Content-Length': fileBuffer.length.toString(),
      'Content-Disposition': inline
        ? `inline; filename="${document.fileName}"`
        : `attachment; filename="${document.fileName}"`,
      'Cache-Control': 'private, max-age=3600'
    })

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'VIEW',
      entityType: 'Document',
      entityId: document.id,
      metadata: {
        applicationId: document.applicationId,
        documentType: document.documentType,
        fileName: document.fileName,
        action: inline ? 'view' : 'download'
      }
    })

    // Return file buffer
    return fileBuffer
  } catch (error: any) {
    console.error('Download document error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to download document'
    })
  }
})
