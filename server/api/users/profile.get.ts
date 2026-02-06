import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)

    // Fetch user with all details
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
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
      data: {
        user
      }
    }
  } catch (error: any) {
    console.error('Get profile error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to get profile'
    })
  }
})
