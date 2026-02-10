import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    
    // Only admin and officers can verify
    if (!['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Akses ditolak'
      })
    }
    
    const preAppId = parseInt(event.context.params?.id as string)
    const body = await readBody(event)
    
    if (!preAppId) {
      throw createError({
        statusCode: 400,
        message: 'ID pra-permohonan tidak sah'
      })
    }
    
    if (!body.status) {
      throw createError({
        statusCode: 400,
        message: 'Status diperlukan'
      })
    }
    
    // Verify pre-application exists
    const preApp = await prisma.preApplication.findUnique({
      where: { id: preAppId }
    })
    
    if (!preApp) {
      throw createError({
        statusCode: 404,
        message: 'Pra-permohonan tidak dijumpai'
      })
    }
    
    // Update pre-application status
    const updated = await prisma.preApplication.update({
      where: { id: preAppId },
      data: {
        status: body.status,
        reviewNotes: body.reviewNotes,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        updatedBy: currentUser.email,
        updatedDate: new Date()
      }
    })
    
    // Log the verification in audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'PreApplication',
        entityId: preAppId,
        metadata: {
          action: 'pre_application_verification',
          status: body.status,
          reviewNotes: body.reviewNotes,
          reviewedBy: currentUser.email
        }
      }
    })
    
    return {
      success: true,
      data: { preApplication: updated },
      message: 'Pengesahan berjaya disimpan'
    }
  } catch (error: any) {
    console.error('Verify pra-permohonan error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal menyimpan pengesahan'
    })
  }
})
