import { prisma } from '~/lib/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  try {
    // Get authorization token
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    const token = authHeader.substring(7)

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      throw createError({
        statusCode: 401,
        message: 'Invalid token'
      })
    }

    // Check if user is admin or officer
    if (!['ADMIN', 'PEGAWAI_KONSUL', 'PEGAWAI_PENDAFTARAN'].includes(decoded.role)) {
      throw createError({
        statusCode: 403,
        message: 'Forbidden - Admin or Officer access required'
      })
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        icNumber: true,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      data: {
        users,
        total: users.length
      }
    }
  } catch (error: any) {
    console.error('Error fetching users:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch users'
    })
  }
})
