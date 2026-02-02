import { authenticateUser } from '~/lib/middleware/auth'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Authenticate the user
    const user = await authenticateUser(event)
    
    // Log the logout in audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGOUT',
        entityType: 'User',
        entityId: user.id,
        metadata: {
          event: 'user_logout',
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error: any) {
    console.error('Logout error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to logout'
    })
  }
})
