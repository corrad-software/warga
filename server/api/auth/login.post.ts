import { verifyPassword } from '~/lib/utils/password'
import { generateToken } from '~/lib/utils/jwt'
import { prisma } from '~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body
    
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      })
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        nationalityStatus: true,
        biometricStatus: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      })
    }
    
    // Check if account is active
    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        message: 'Account is inactive. Please contact support.'
      })
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid email or password'
      })
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    
    // Log the login in audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        metadata: {
          event: 'user_login',
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      }
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to login'
    })
  }
})
