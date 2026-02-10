import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const query = getQuery(event)
    
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const status = query.status as string
    const type = query.type as string
    
    const skip = (page - 1) * limit
    
    // Build where clause based on user role
    const where: any = {}
    
    // PEMOHON can only see their own applications
    if (currentUser.role === 'PEMOHON') {
      where.createdBy = currentUser.id
    }
    
    // Add filters
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.applicationType = type
    }
    
    // Get applications with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdDate: 'desc'
        },
        include: {
          documents: {
            select: {
              id: true,
              documentType: true,
              status: true,
              createdDate: true
            }
          },
          payments: {
            select: {
              id: true,
              billNo: true,
              amount: true,
              paymentStatus: true
            }
          }
        }
      }),
      prisma.application.count({ where })
    ])
    
    return {
      success: true,
      data: {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
  } catch (error: any) {
    console.error('Get applications error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to get applications'
    })
  }
})
