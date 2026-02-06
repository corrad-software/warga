import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const query = getQuery(event)
    
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const status = query.status as string
    const search = query.search as string
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {
      // Only show pre-applications that have linked applications (with APP- reference)
      applications: {
        some: {}
      }
    }
    
    // Add status filter
    if (status) {
      where.status = status
    }
    
    // Add search filter (search by applicant name or application ref)
    if (search) {
      where.AND = [
        {
          OR: [
            {
              applicant: {
                fullName: {
                  contains: search,
                }
              }
            },
            {
              applications: {
                some: {
                  applicationRef: {
                    contains: search,
                  }
                }
              }
            }
          ]
        }
      ]
    }
    
    // Get pre-applications with pagination
    const [preApplications, total] = await Promise.all([
      prisma.preApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdDate: 'desc'
        },
        include: {
          applicant: {
            select: {
              id: true,
              fullName: true,
              applicationType: true,
              gender: true,
              nationality: true,
              idNumber: true,
            }
          },
          applications: {
            select: {
              id: true,
              applicationRef: true,
              applicationType: true,
              status: true,
              registeredAt: true,
            },
            take: 1,
            orderBy: {
              createdDate: 'desc'
            }
          }
        }
      }),
      prisma.preApplication.count({ where })
    ])
    
    return {
      success: true,
      data: {
        preApplications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error: any) {
    console.error('Get pendaftaran permohonan error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Gagal mendapatkan senarai pendaftaran permohonan'
    })
  }
})
