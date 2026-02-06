import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Get user from token
    const user = await authenticateUser(event)

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Notification ID is required'
      })
    }

    // Update notification as read
    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId: user.id
      },
      data: {
        readAt: new Date()
      }
    })

    return {
      success: true,
      data: notification
    }
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to mark notification as read'
    })
  }
})
