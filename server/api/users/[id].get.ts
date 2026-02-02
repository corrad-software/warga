import { authenticateUser } from '~/lib/middleware/auth'
import { requireOfficer } from '~/lib/middleware/rbac'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Authenticate user
    const currentUser = await authenticateUser(event)
    
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }
    
    // Check permissions: users can view their own profile, officers can view any profile
    if (currentUser.id !== userId && currentUser.role === 'PEMOHON') {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions'
      })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        icNumber: true,
        passportNumber: true,
        phoneNumber: true,
        address: true,
        dateOfBirth: true,
        placeOfBirth: true,
        role: true,
        nationalityStatus: true,
        biometricStatus: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }
    
    return {
      success: true,
      data: { user }
    }
  } catch (error: any) {
    console.error('Get user error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to get user'
    })
  }
})
