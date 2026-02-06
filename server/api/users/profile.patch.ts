import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await authenticateUser(event)
    const body = await readBody(event)

    // Validate required fields
    if (!body.name || body.name.trim() === '') {
      throw createError({
        statusCode: 400,
        message: 'Name is required'
      })
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: body.name.trim(),
        icNumber: body.icNumber?.trim() || null,
        passportNumber: body.passportNumber?.trim() || null,
        phoneNumber: body.phoneNumber?.trim() || null,
        address: body.address?.trim() || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        placeOfBirth: body.placeOfBirth?.trim() || null
      },
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
        updatedAt: true
      }
    })

    return {
      success: true,
      data: {
        user: updatedUser
      },
      message: 'Profile updated successfully'
    }
  } catch (error: any) {
    console.error('Update profile error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update profile'
    })
  }
})
