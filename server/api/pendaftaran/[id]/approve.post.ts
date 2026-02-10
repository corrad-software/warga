import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    
    // Only admin and officers can approve
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
    
    if (!body.decision) {
      throw createError({
        statusCode: 400,
        message: 'Status kelulusan diperlukan'
      })
    }
    
    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    })
    
    if (!application) {
      throw createError({
        statusCode: 404,
        message: 'Permohonan tidak dijumpai'
      })
    }
    
    // Create approval record
    const approval = await prisma.approval.create({
      data: {
        applicationId: applicationId,
        decision: body.decision,
        decisionNotes: body.decisionNotes || null,
        approvedBy: currentUser.id,
        approvedAt: new Date(),
        createdBy: currentUser.email,
        createdDate: new Date()
      }
    })
    
    // Update application status based on decision
    const newStatus = body.decision === 'LULUS' ? 'DILULUSKAN' : 'DITOLAK'
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        updatedBy: currentUser.email,
        updatedDate: new Date()
      }
    })
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Application',
        entityId: applicationId,
        metadata: {
          action: 'approve_application',
          decision: body.decision,
          notes: body.decisionNotes,
          approvedBy: currentUser.email,
          applicationRef: application.applicationRef
        }
      }
    })
    
    return {
      success: true,
      data: { approval },
      message: 'Kelulusan berjaya disimpan'
    }
  } catch (error: any) {
    console.error('Approve application error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal menyimpan kelulusan'
    })
  }
})
