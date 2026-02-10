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
    
    const query = getQuery(event)
    const search = query.search as string
    
    // Build where clause - find applications with generated certificates
    const where: any = {
      certificates: {
        some: {
          certificateNo: {
            not: null
          }
        }
      }
    }
    
    // Add search filter
    if (search) {
      where.OR = [
        {
          applicationRef: {
            contains: search
          }
        },
        {
          preApplication: {
            applicant: {
              fullName: {
                contains: search
              }
            }
          }
        },
        {
          preApplication: {
            applicant: {
              idNumber: {
                contains: search
              }
            }
          }
        }
      ]
    }
    
    // Fetch applications with certificates
    const applications = await prisma.application.findMany({
      where,
      orderBy: {
        createdDate: 'desc'
      },
      include: {
        preApplication: {
          include: {
            applicant: {
              select: {
                id: true,
                fullName: true,
                idNumber: true,
                dateOfBirth: true,
                placeOfBirth: true,
                gender: true
              }
            }
          }
        },
        approvals: {
          orderBy: {
            approvedAt: 'desc'
          },
          take: 1
        },
        oathRecords: {
          orderBy: {
            executedAt: 'desc'
          },
          take: 1,
          include: {
            schedule: {
              select: {
                oathDate: true,
                oathTime: true,
                location: true,
                status: true
              }
            }
          }
        },
        certificates: {
          orderBy: {
            createdDate: 'desc'
          },
          take: 1
        }
      }
    })
    
    // Transform data to match frontend expectations
    const transformedData = applications.map(app => ({
      ...app,
      applicant: app.preApplication?.applicant || null,
      approval: app.approvals[0] ? {
        ...app.approvals[0],
        status: app.approvals[0].decision,
        approverName: 'Pegawai JPN'
      } : null,
      oathRecord: app.oathRecords[0] ? {
        ...app.oathRecords[0],
        status: app.oathRecords[0].schedule?.status || 'SELESAI',
        oathDate: app.oathRecords[0].schedule?.oathDate || app.oathRecords[0].executedAt,
        oathLocation: app.oathRecords[0].schedule?.location
      } : null,
      certificate: app.certificates[0] || null,
      certificateEligibility: {
        status: 'LAYAK',
        notes: 'Telah disahkan layak untuk pengeluaran sijil'
      },
      // Mock handover data (extend this with actual table later)
      handover: null
    }))
    
    return {
      success: true,
      data: transformedData
    }
  } catch (error: any) {
    console.error('Get penyerahan sijil error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal mendapatkan senarai permohonan'
    })
  }
})
