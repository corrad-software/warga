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
        message: 'Status kelayakan diperlukan'
      })
    }
    
    // Verify application exists
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
    
    // If status is LAYAK, create certificate record
    if (body.status === 'LAYAK') {
      // Check if certificate already exists
      if (application.certificates.length === 0) {
        // Generate certificate number
        const certNo = `CERT-${Date.now()}-${applicationId}`
        
        await prisma.certificate.create({
          data: {
            applicationId: applicationId,
            certificateNo: certNo,
            issuedBy: currentUser.id,
            issuedAt: new Date(),
            createdBy: currentUser.email,
            createdDate: new Date()
          }
        })
      }
    }
    
    // Log the verification in audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Application',
        entityId: applicationId,
        metadata: {
          action: 'certificate_eligibility_verification',
          status: body.status,
          notes: body.notes,
          verifiedBy: currentUser.email
        }
      }
    })
    
    return {
      success: true,
      message: 'Pengesahan berjaya disimpan'
    }
  } catch (error: any) {
    console.error('Save pengesahan sijil error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal menyimpan pengesahan'
    })
  }
})
