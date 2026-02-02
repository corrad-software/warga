import { authenticateUser } from '~/lib/middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    // Authenticate the user
    const user = await authenticateUser(event)
    
    return {
      success: true,
      data: {
        user
      }
    }
  } catch (error: any) {
    console.error('Get current user error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to get current user'
    })
  }
})
