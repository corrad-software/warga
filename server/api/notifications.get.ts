import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Get user from token
    const user = await authenticateUser(event)

    // Fetch notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Count unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        readAt: null
      }
    })

    return {
      success: true,
      data: {
        notifications,
        unreadCount
      }
    }
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch notifications'
    })
  }
})
