import type { H3Event } from 'h3'
import { verifyToken, type JwtPayload } from '../utils/jwt'
import { prisma } from '../prisma'

/**
 * Get the JWT token from Authorization header
 */
export function getTokenFromHeader(event: H3Event): string | null {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
}

/**
 * Authenticate user from JWT token
 * Throws error if authentication fails
 */
export async function authenticateUser(event: H3Event) {
  const token = getTokenFromHeader(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }
  
  try {
    const payload = verifyToken(token)
    
    // Fetch user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nationalityStatus: true,
        biometricStatus: true,
        isActive: true,
        emailVerified: true
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'User not found'
      })
    }
    
    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        message: 'Account is inactive'
      })
    }
    
    // Attach user to event context
    event.context.user = user
    
    return user
  } catch (error: any) {
    throw createError({
      statusCode: 401,
      message: error.message || 'Invalid token'
    })
  }
}

/**
 * Get authenticated user from event context
 * Returns null if not authenticated
 */
export function getAuthenticatedUser(event: H3Event) {
  return event.context.user || null
}
