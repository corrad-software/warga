import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string) || ''
    const status = (query.status as string) || ''

    // Fetch applications with their pre-application, applicant, and biometrics
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
          // Status filter for biometrics
          status ? {
            biometrics: {
              some: {
                status: status
              }
            }
          } : {},
          // Only include applications that have biometrics
          {
            biometrics: {
              some: {}
            }
          }
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
        biometrics: {
          orderBy: { createdDate: 'asc' }
        }
      },
      orderBy: { createdDate: 'desc' }
    })

    // Transform data for the frontend
    const result = applications.map(app => {
      // Calculate biometric statistics
      const totalBiometrics = app.biometrics.length
      const completeBiometrics = app.biometrics.filter(b => b.status === 'SAH' || b.status === 'LENGKAP').length
      const incompleteBiometrics = app.biometrics.filter(b => 
        b.status === 'TIDAK SAH' || b.status === 'TIDAK_LENGKAP' || b.status === 'TIDAK_HADIR' || !b.status
      ).length
      
      let biometricStatus = 'TIDAK SAH'
      if (totalBiometrics > 0) {
        if (completeBiometrics === totalBiometrics) {
          biometricStatus = 'SAH'
        } else if (completeBiometrics > 0) {
          biometricStatus = 'SEBAHAGIAN'
        }
      }

      return {
        id: app.id,
        applicationRef: app.applicationRef,
        applicationType: app.applicationType || app.preApplication?.applicant?.applicationType || 'PERKARA_15_2',
        status: app.status,
        biometricStatus,
        applicant: app.preApplication?.applicant ? {
          id: app.preApplication.applicant.id,
          fullName: app.preApplication.applicant.fullName,
          idNumber: app.preApplication.applicant.idNumber,
        } : null,
        biometrics: app.biometrics,
        biometricStats: {
          total: totalBiometrics,
          complete: completeBiometrics,
          incomplete: incompleteBiometrics,
        }
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Error fetching applications for biometric verification:', error)
    throw createError({
      statusCode: 500,
      message: 'Gagal mendapatkan senarai permohonan'
    })
  }
})
