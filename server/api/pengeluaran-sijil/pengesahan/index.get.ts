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
    
    // Build where clause - find applications with approval and completed oath
    const where: any = {
      // Must have approval
      approvals: {
        some: {
          decision: 'LULUS'
        }
      },
      // Must have completed oath
      oathRecords: {
        some: {
          executedAt: {
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
    
    // Fetch qualified applications
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
          select: {
            id: true,
            executedAt: true,
            remarks: true,
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
          take: 1,
          select: {
            id: true,
            certificateNo: true,
            issuedAt: true,
            issuedBy: true
          }
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
        approverName: 'Pegawai JPN' // You can fetch actual user name from User table if needed
      } : null,
      oathRecord: app.oathRecords[0] ? {
        ...app.oathRecords[0],
        status: app.oathRecords[0].schedule?.status || 'SELESAI',
        oathDate: app.oathRecords[0].schedule?.oathDate || app.oathRecords[0].executedAt,
        oathLocation: app.oathRecords[0].schedule?.location
      } : null,
      certificate: app.certificates[0] || null,
      // Mock certificate eligibility data (you can extend this with actual table later)
      certificateEligibility: app.certificates[0] ? {
        status: 'LAYAK',
        notes: 'Telah diluluskan untuk pengeluaran sijil'
      } : null
    }))
    
    return {
      success: true,
      data: transformedData
    }
  } catch (error: any) {
    console.error('Get pengesahan sijil error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal mendapatkan senarai permohonan'
    })
  }
})
