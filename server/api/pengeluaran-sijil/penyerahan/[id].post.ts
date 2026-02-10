import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    
    // Only admin and officers can access
    if (!['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        message: 'Akses ditolak'
      })
    }
    
    const applicationId = parseInt(event.context.params?.id as string)
    const body = await readBody(event)
    
    if (!applicationId) {
      throw createError({
        statusCode: 400,
        message: 'ID permohonan tidak sah'
      })
    }
    
    if (!body.status) {
      throw createError({
        statusCode: 400,
        message: 'Status penyerahan diperlukan'
      })
    }
    
    if (!body.handoverDate) {
      throw createError({
        statusCode: 400,
        message: 'Tarikh penyerahan diperlukan'
      })
    }
    
    // Verify application exists with certificate
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        certificates: true
      }
    })
    
    if (!application) {
      throw createError({
        statusCode: 404,
        message: 'Permohonan tidak dijumpai'
      })
    }
    
    if (application.certificates.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Sijil belum dijana untuk permohonan ini'
      })
    }
    
    // Log the handover in audit log with details
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Certificate',
        entityId: application.certificates[0].id,
        metadata: {
          action: 'certificate_handover',
          status: body.status,
          handoverDate: body.handoverDate,
          notes: body.notes,
          handedOverBy: currentUser.email,
          applicationId: applicationId,
          certificateNo: application.certificates[0].certificateNo
        }
      }
    })
    
    return {
      success: true,
      message: 'Maklumat penyerahan berjaya disimpan'
    }
  } catch (error: any) {
    console.error('Save handover error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal menyimpan maklumat penyerahan'
    })
  }
})
