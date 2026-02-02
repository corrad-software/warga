import { hashPassword } from '~/lib/utils/password'
import { generateToken } from '~/lib/utils/jwt'
import { prisma } from '~/lib/prisma'
import type { UserRole } from '@prisma/client'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validate required fields
    const { email, password, name, phoneNumber } = body
    
    if (!email || !password || !name) {
      throw createError({
        statusCode: 400,
        message: 'Email, password, and name are required'
      })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format'
      })
    }
    
    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      throw createError({
        statusCode: 400,
        message: 'Password must be at least 8 characters long'
      })
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'User with this email already exists'
      })
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create user (default role is PEMOHON)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phoneNumber: phoneNumber || null,
        role: 'PEMOHON' as UserRole
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        nationalityStatus: true,
        biometricStatus: true,
        isActive: true,
        emailVerified: true,
        createdAt: true
      }
    })
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })
    
    // Log the registration in audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        metadata: {
          event: 'user_registered',
          role: user.role
        }
      }
    })
    
    return {
      success: true,
      data: {
        user,
        token
      }
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to register user'
    })
  }
})
