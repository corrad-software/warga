import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string) || ''
    const status = (query.status as string) || ''

    // Fetch applications with their pre-application, applicant, and documents
    const applications = await prisma.application.findMany({
      where: {
        AND: [
          // Search filter
          search ? {
            OR: [
              { applicationRef: { contains: search } },
              { preApplication: { applicant: { fullName: { contains: search } } } },
              { preApplication: { applicant: { idNumber: { contains: search } } } },
            ]
          } : {},
          // Status filter for document verification
          status ? {
            documents: {
              some: {
                status: status
              }
            }
          } : {}
        ]
      },
      include: {
        preApplication: {
          include: {
            applicant: {
              select: {
                id: true,
                fullName: true,
                idNumber: true,
                applicationType: true,
              }
            }
          }
        },
        documents: {
          orderBy: { createdDate: 'asc' }
        }
      },
      orderBy: { createdDate: 'desc' }
    })

    // Transform data for the frontend
    const result = applications.map(app => {
      // Calculate document verification status
      const totalDocs = app.documents.length
      const verifiedDocs = app.documents.filter(d => d.status === 'DISAHKAN').length
      const pendingDocs = app.documents.filter(d => d.status === 'DIMUATNAIK' || !d.status).length
      
      let verificationStatus = 'BELUM_DISEMAK'
      if (totalDocs > 0) {
        if (verifiedDocs === totalDocs) {
          verificationStatus = 'LENGKAP'
        } else if (verifiedDocs > 0 || pendingDocs < totalDocs) {
          verificationStatus = 'DALAM_SEMAKAN'
        }
      }

      return {
        id: app.id,
        applicationRef: app.applicationRef,
        applicationType: app.applicationType || app.preApplication?.applicant?.applicationType || 'PERKARA_15_2',
        status: app.status,
        verificationStatus,
        applicant: app.preApplication?.applicant ? {
          id: app.preApplication.applicant.id,
          fullName: app.preApplication.applicant.fullName,
          idNumber: app.preApplication.applicant.idNumber,
        } : null,
        documents: app.documents,
        documentStats: {
          total: totalDocs,
          verified: verifiedDocs,
          pending: pendingDocs,
          rejected: app.documents.filter(d => d.status === 'TIDAK_DISAHKAN').length,
        }
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Error fetching applications for document verification:', error)
    throw createError({
      statusCode: 500,
      message: 'Gagal mendapatkan senarai permohonan'
    })
  }
})
