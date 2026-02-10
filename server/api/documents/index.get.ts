import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const query = getQuery(event)

    const { applicationId, status: docStatus, documentType } = query

    // Build filter conditions
    const where: any = {}

    // If user is applicant, only show their documents
    if (currentUser.role === 'PEMOHON') {
      // Get user's applications
      const userApplications = await prisma.application.findMany({
        where: { createdBy: currentUser.id },
        select: { id: true }
      })

      where.applicationId = {
        in: userApplications.map(app => app.id)
      }
    }

    // Filter by applicationId if provided
    if (applicationId) {
      const appId = parseInt(applicationId as string)
      // Verify access to this application
      const application = await prisma.application.findUnique({
        where: { id: appId }
      })

      if (!application) {
        throw createError({
          statusCode: 404,
          message: 'Application not found'
        })
      }

      const hasAccess =
        application.createdBy === currentUser.id ||
        ['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(currentUser.role)

      if (!hasAccess) {
        throw createError({
          statusCode: 403,
          message: 'Access denied'
        })
      }

      where.applicationId = appId
    }

    // Filter by document status
    if (docStatus) {
      where.status = docStatus as string
    }

    // Filter by document type
    if (documentType) {
      where.documentType = documentType as string
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            applicationRef: true,
            applicationType: true,
            status: true
          }
        }
      },
      orderBy: {
        createdDate: 'desc'
      }
    })

    return {
      success: true,
      data: { documents }
    }
  } catch (error: any) {
    console.error('Fetch documents error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch documents'
    })
  }
})
