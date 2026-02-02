import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'
import { parseMultipartFile, saveUploadedFile } from '~/lib/utils/upload'
import { createAuditLog } from '~/lib/utils/audit'
import { queueDocumentForOCR } from '~/lib/services/ocr'
import type { DocumentType } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)

    // Parse multipart form data
    const { file, fileName, mimeType, fields } = await parseMultipartFile(event)

    const { applicationId, documentType } = fields

    // Validate required fields
    if (!applicationId) {
      throw createError({
        statusCode: 400,
        message: 'Application ID is required'
      })
    }

    if (!documentType) {
      throw createError({
        statusCode: 400,
        message: 'Document type is required'
      })
    }

    // Validate document type
    const validTypes: DocumentType[] = [
      'BIRTH_CERTIFICATE',
      'PASSPORT',
      'IC_PARENTS',
      'MARRIAGE_CERTIFICATE',
      'SUPPORTING_LETTER',
      'OTHER'
    ]

    if (!validTypes.includes(documentType as DocumentType)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid document type'
      })
    }

    // Verify application exists and user has access
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })

    if (!application) {
      throw createError({
        statusCode: 404,
        message: 'Application not found'
      })
    }

    // Check if user owns the application or is an admin/officer
    const hasAccess =
      application.userId === currentUser.id ||
      ['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(currentUser.role)

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    // Save file to storage
    const uploadedFile = await saveUploadedFile(file, fileName, mimeType, {
      subFolder: 'documents'
    })

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        applicationId,
        documentType: documentType as DocumentType,
        fileName: uploadedFile.fileName,
        filePath: uploadedFile.filePath,
        fileSize: uploadedFile.fileSize,
        mimeType: uploadedFile.mimeType,
        verificationStatus: 'PENDING'
      },
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
      action: 'CREATE',
      entityType: 'Document',
      entityId: document.id,
      metadata: {
        applicationId,
        documentType,
        fileName: uploadedFile.fileName,
        fileSize: uploadedFile.fileSize
      }
    })

    // Trigger OCR processing asynchronously (don't wait for completion)
    queueDocumentForOCR(document.id).catch(err => {
      console.error('[Document Upload] OCR queue error:', err)
    })

    return {
      success: true,
      data: { document }
    }
  } catch (error: any) {
    console.error('Upload document error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to upload document'
    })
  }
})
