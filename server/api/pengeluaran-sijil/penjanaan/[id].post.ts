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
    
    if (!applicationId) {
      throw createError({
        statusCode: 400,
        message: 'ID permohonan tidak sah'
      })
    }
    
    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        certificates: true,
        preApplication: {
          include: {
            applicant: true
          }
        }
      }
    })
    
    if (!application) {
      throw createError({
        statusCode: 404,
        message: 'Permohonan tidak dijumpai'
      })
    }
    
    // Check if certificate already exists
    if (application.certificates.length > 0) {
      throw createError({
        statusCode: 400,
        message: 'Sijil telah dijana untuk permohonan ini'
      })
    }
    
    // Generate certificate number
    const year = new Date().getFullYear()
    const certNo = `JPN/${year}/${String(applicationId).padStart(6, '0')}`
    
    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        applicationId: applicationId,
        certificateNo: certNo,
        issuedBy: currentUser.id,
        issuedAt: new Date(),
        createdBy: currentUser.email,
        createdDate: new Date()
      }
    })
    
    // Log the generation in audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'Certificate',
        entityId: certificate.id,
        metadata: {
          action: 'certificate_generated',
          certificateNo: certNo,
          applicationId: applicationId,
          issuedBy: currentUser.email
        }
      }
    })
    
    return {
      success: true,
      data: { certificate },
      message: 'Sijil berjaya dijana'
    }
  } catch (error: any) {
    console.error('Generate certificate error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal menjana sijil'
    })
  }
})
