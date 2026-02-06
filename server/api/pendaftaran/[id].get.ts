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
    
    // Fetch application with related data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        preApplication: {
          include: {
            applicant: {
              include: {
                parents: true,
                siblings: true,
                offenceConfinations: true
              }
            }
          }
        },
        approvals: {
          orderBy: {
            approvedAt: 'desc'
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
    
    // Get latest approval
    const latestApproval = application.approvals.length > 0 ? application.approvals[0] : null
    
    return {
      success: true,
      data: {
        application: {
          ...application,
          latestApproval
        }
      }
    }
  } catch (error: any) {
    console.error('Get application error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal mendapatkan butiran permohonan'
    })
  }
})
