import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = (query.search as string) || ''
    const status = (query.status as string) || ''

    // Fetch applications with their oath schedules
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
          // Status filter for oath schedules
          status ? {
            oathSchedules: {
              some: {
                status: status
              }
            }
          } : {},
          // Only include applications that have oath schedules
          {
            oathSchedules: {
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
        oathSchedules: {
          include: {
            oathRecords: {
              orderBy: { createdDate: 'desc' }
            }
          },
          orderBy: { oathDate: 'desc' }
        },
        notifications: {
          where: {
            recipientType: 'PEMOHON'
          },
          orderBy: { sentAt: 'desc' }
        }
      },
      orderBy: { createdDate: 'desc' }
    })

    // Transform data for the frontend
    const result = applications.map(app => {
      // Get the latest oath schedule
      const latestSchedule = app.oathSchedules[0]
      
      // Calculate oath statistics
      const totalSchedules = app.oathSchedules.length
      const completedOaths = app.oathSchedules.filter(s => s.status === 'SELESAI').length
      const scheduledOaths = app.oathSchedules.filter(s => s.status === 'DIJADUALKAN').length
      const postponedOaths = app.oathSchedules.filter(s => s.status === 'DITANGGUH').length
      const missedOaths = app.oathSchedules.filter(s => s.status === 'TIDAK_HADIR').length
      
      // Determine overall oath status
      let oathStatus = 'BELUM_DIJADUAL'
      if (latestSchedule) {
        oathStatus = latestSchedule.status || 'DIJADUALKAN'
      }

      // Count notifications
      const totalNotifications = app.notifications.length
      const successfulNotifications = app.notifications.filter(n => n.status === 'BERJAYA').length
      const failedNotifications = app.notifications.filter(n => n.status === 'GAGAL').length

      return {
        id: app.id,
        applicationRef: app.applicationRef,
        applicationType: app.applicationType || app.preApplication?.applicant?.applicationType || 'PERKARA_15_2',
        status: app.status,
        oathStatus,
        applicant: app.preApplication?.applicant ? {
          id: app.preApplication.applicant.id,
          fullName: app.preApplication.applicant.fullName,
          idNumber: app.preApplication.applicant.idNumber,
        } : null,
        oathSchedules: app.oathSchedules,
        notifications: app.notifications,
        oathStats: {
          total: totalSchedules,
          completed: completedOaths,
          scheduled: scheduledOaths,
          postponed: postponedOaths,
          missed: missedOaths,
        },
        notificationStats: {
          total: totalNotifications,
          successful: successfulNotifications,
          failed: failedNotifications,
        }
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (error: any) {
    console.error('Error fetching applications for oath schedules:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    throw createError({
      statusCode: 500,
      message: `Gagal mendapatkan senarai jadual sumpah: ${error.message}`
    })
  }
})
