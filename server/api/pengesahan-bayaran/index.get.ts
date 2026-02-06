import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string) || ''
    const status = (query.status as string) || ''

    // Fetch applications with their pre-application, applicant, and payments
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
          // Status filter for payments
          status ? {
            payments: {
              some: {
                paymentStatus: status
              }
            }
          } : {},
          // Only include applications that have payments
          {
            payments: {
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
        payments: {
          include: {
            receipts: true
          },
          orderBy: { createdDate: 'asc' }
        }
      },
      orderBy: { createdDate: 'desc' }
    })

    // Transform data for the frontend
    const result = applications.map(app => {
      // Categorize payments based on payment_type
      const applicationPayments = app.payments.filter(p => 
        p.paymentType === 'PERMOHONAN' || !p.paymentType
      )
      const certificatePayments = app.payments.filter(p => 
        p.paymentType === 'SIJIL'
      )

      // Calculate payment statistics
      const totalPayments = app.payments.length
      const completedPayments = app.payments.filter(p => p.paymentStatus === 'BERJAYA').length
      const pendingPayments = app.payments.filter(p => 
        p.paymentStatus === 'MENUNGGU' || p.paymentStatus === 'BELUM_BAYAR'
      ).length
      
      let paymentVerificationStatus = 'BELUM_BAYAR'
      if (totalPayments > 0) {
        if (completedPayments === totalPayments) {
          paymentVerificationStatus = 'LENGKAP'
        } else if (completedPayments > 0) {
          paymentVerificationStatus = 'SEBAHAGIAN'
        }
      }

      return {
        id: app.id,
        applicationRef: app.applicationRef,
        applicationType: app.applicationType || app.preApplication?.applicant?.applicationType || 'PERKARA_15_2',
        status: app.status,
        paymentVerificationStatus,
        applicant: app.preApplication?.applicant ? {
          id: app.preApplication.applicant.id,
          fullName: app.preApplication.applicant.fullName,
          idNumber: app.preApplication.applicant.idNumber,
        } : null,
        payments: {
          application: applicationPayments,
          certificate: certificatePayments,
        },
        paymentStats: {
          total: totalPayments,
          completed: completedPayments,
          pending: pendingPayments,
          failed: app.payments.filter(p => p.paymentStatus === 'GAGAL').length,
        }
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Error fetching applications for payment verification:', error)
    throw createError({
      statusCode: 500,
      message: 'Gagal mendapatkan senarai permohonan'
    })
  }
})
